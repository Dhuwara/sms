import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';

// ── Exams ─────────────────────────────────────────────────────────────────────

export const getExams = async (req, res, next) => {
  try {
    const { classId, examType, invigilatorId } = req.query;
    const filter = {};
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
    const exam = await Exam.create({ ...req.body, createdBy: req.user.userId });
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
    const calcGrade = (marks) => {
      const pct = (marks / maxScore) * 100;
      if (pct >= 90) return 'A+';
      if (pct >= 80) return 'A';
      if (pct >= 70) return 'B+';
      if (pct >= 60) return 'B';
      if (pct >= 50) return 'C';
      if (pct >= 35) return 'D';
      return 'F';
    };

    const saved = await Promise.all(
      results.map(r =>
        ExamResult.findOneAndUpdate(
          { examId: req.params.id, studentId: r.studentId },
          { examId: req.params.id, studentId: r.studentId, marks: r.marks, grade: calcGrade(r.marks), remarks: r.remarks || '' },
          { upsert: true, new: true }
        )
      )
    );
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
