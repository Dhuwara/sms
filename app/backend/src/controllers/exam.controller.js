import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Parent from '../models/Parent.js';
import { sendWhatsAppBulk, getParentPhones } from '../utils/whatsapp.js';
import { resolveGrade } from './gradeConfig.controller.js';

// ── Exams ─────────────────────────────────────────────────────────────────────

export const getExams = async (req, res, next) => {
  try {
    const { classId, examType, invigilatorId } = req.query;
    const filter = { schoolId: req.user.schoolId };
    if (classId) filter.classId = classId;
    if (examType) filter.examType = examType;
    if (invigilatorId) filter.invigilatorId = invigilatorId;

    const exams = await Exam.find(filter)
      .populate('classId', 'name section gradeLevel')
      .populate({ path: 'invigilatorId', populate: { path: 'userId', select: 'name email' } })
      .sort({ date: -1 });
    res.json({ success: true, data: exams });
  } catch (err) {
    next(err);
  }
};

// Get subjects assigned to a class
export const getClassSubjects = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    // Convert string subjects to objects with _id and name
    const subjects = classData.subjects.map((subj, idx) => ({
      _id: `${classId}-${idx}`, // Generate a unique ID for each subject
      name: subj,
    }));
    res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user.userId, schoolId: req.user.schoolId });

    // WhatsApp: Notify parents that an exam has been scheduled (fire-and-forget)
    if (exam.classId) {
      const cls = await Class.findById(exam.classId).select('name section');
      const className = cls ? `${cls.name} ${cls.section || ''}`.trim() : '';
      const dateStr = exam.date ? new Date(exam.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
      const studentsInClass = await Student.find({ classId: exam.classId, status: 'active' }).select('_id');
      const studentIds = studentsInClass.map(s => s._id);

      getParentPhones(Student, Parent, studentIds)
        .then((parentData) => {
          const recipients = parentData.map(p => ({
            phone: p.phone,
            message: `Dear ${p.parentName},\n\nExam scheduled for ${className}:\n\n📝 ${exam.name || exam.examType || 'Exam'}\n📚 Subject: ${exam.subject || '—'}\n📅 Date: ${dateStr}\n⏰ Time: ${exam.startTime || '—'}\n📊 Max Score: ${exam.maxScore || 100}\n\nPlease ensure ${p.studentName} is well prepared.\n\n- School Management`,
          }));
          return sendWhatsAppBulk(recipients);
        })
        .catch(err => console.error('Exam scheduled WhatsApp alert failed:', err.message));
    }

    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    await ExamResult.deleteMany({ examId: req.params.id });
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Results ───────────────────────────────────────────────────────────────────

export const getExamResults = async (req, res, next) => {
  try {
    const results = await ExamResult.find({ examId: req.params.id })
      .populate({ path: 'studentId', select: 'rollNumber', populate: { path: 'userId', select: 'name' } });
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

export const addExamResult = async (req, res, next) => {
  try {
    const { studentId, marks, remarks } = req.body;
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const result = await ExamResult.findOneAndUpdate(
      { examId: req.params.id, studentId },
      { examId: req.params.id, studentId, marks, remarks },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const bulkAddResults = async (req, res, next) => {
  try {
    const { results } = req.body; // [{ studentId, marks, remarks }]
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const maxScore = exam.maxScore || 100;
    const calcGrade = async (marks) => {
      const pct = (marks / maxScore) * 100;
      return resolveGrade(req.user.schoolId, pct);
    };

    const saved = await Promise.all(
      results.map(async r => {
        const grade = await calcGrade(r.marks);
        return ExamResult.findOneAndUpdate(
          { examId: req.params.id, studentId: r.studentId },
          { examId: req.params.id, studentId: r.studentId, marks: r.marks, grade, remarks: r.remarks || '' },
          { upsert: true, new: true }
        );
      })
    );

    // WhatsApp: Notify parents of exam results (fire-and-forget)
    const studentIds = results.map(r => r.studentId);
    const cls = await Class.findById(exam.classId).select('name section');
    const className = cls ? `${cls.name} ${cls.section || ''}`.trim() : '';

    getParentPhones(Student, Parent, studentIds)
      .then(async (parentData) => {
        const recipients = await Promise.all(parentData.map(async (p) => {
          const result = results.find(r => String(r.studentId) === String(p.studentId));
          const marks = result?.marks ?? '—';
          const grade = await resolveGrade(req.user.schoolId, ((result?.marks || 0) / maxScore) * 100);
          return {
            phone: p.phone,
            message: `Dear ${p.parentName},\n\n${p.studentName} (${className}) exam results:\n\n📝 ${exam.name || exam.examType || 'Exam'}\n📊 Subject: ${exam.subject || '—'}\n✅ Marks: ${marks}/${maxScore}\n🎯 Grade: ${grade}\n\n- School Management`,
          };
        }));
        return sendWhatsAppBulk(recipients);
      })
      .catch((err) => console.error('Exam result WhatsApp alert failed:', err.message));

    res.json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
};

export const getStudentResults = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const results = await ExamResult.find({ studentId: student._id })
      .populate({ path: 'examId', populate: { path: 'classId', select: 'name section' } });
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};
