import fs from 'fs';
import path from 'path';
import Homework from '../models/Homework.js';
import HomeworkSubmission from '../models/HomeworkSubmission.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'homework');

export const getHomework = async (req, res, next) => {
  try {
    const { classId, status } = req.query;
    const filter = {};
    if (classId) filter.classId = classId;
    if (status) filter.status = status;

    const homework = await Homework.find(filter)
      .populate('classId', 'name section')
      .populate({ path: 'assignedBy', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

export const createHomework = async (req, res, next) => {
  try {
    const { title, description, classId, subject, dueDate } = req.body;
    if (!title || !classId || !subject || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, class, subject, and due date are required' });
    }

    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const attachments = (req.files || []).map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
    }));

    const homework = await Homework.create({
      title, description, classId, subject, dueDate: new Date(dueDate),
      assignedBy: staff._id, attachments,
    });
    const populated = await Homework.findById(homework._id).populate('classId', 'name section');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

export const updateHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!homework) return res.status(404).json({ success: false, message: 'Homework not found' });
    res.json({ success: true, data: homework });
  } catch (err) {
    next(err);
  }
};

export const deleteHomework = async (req, res, next) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) return res.status(404).json({ success: false, message: 'Homework not found' });
    // Delete attached files
    for (const att of homework.attachments || []) {
      const fp = path.join(UPLOAD_DIR, att.filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await homework.deleteOne();
    await HomeworkSubmission.deleteMany({ homeworkId: req.params.id });
    res.json({ success: true, message: 'Homework deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/homework/:id/attachments/:filename — download attachment
export const downloadAttachment = async (req, res, next) => {
  try {
    console.log('Download request:', { id: req.params.id, filename: req.params.filename });

    const homework = await Homework.findById(req.params.id);
    if (!homework) return res.status(404).json({ success: false, message: 'Homework not found' });

    console.log('Homework attachments:', homework.attachments);

    const att = homework.attachments.find(a => a.filename === req.params.filename);
    if (!att) return res.status(404).json({ success: false, message: 'Attachment not found' });

    const filePath = path.join(UPLOAD_DIR, att.filename);
    console.log('Looking for file at:', filePath);
    console.log('Upload directory:', UPLOAD_DIR);
    console.log('File exists:', fs.existsSync(filePath));

    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found on server' });

    res.download(filePath, att.originalName);
  } catch (err) {
    next(err);
  }
};

export const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await HomeworkSubmission.find({ homeworkId: req.params.id })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .sort({ submittedAt: -1 });
    res.json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
};

export const submitHomework = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const homework = await Homework.findById(req.params.id);
    if (!homework) return res.status(404).json({ success: false, message: 'Homework not found' });

    const isLate = new Date() > new Date(homework.dueDate);

    const submission = await HomeworkSubmission.findOneAndUpdate(
      { homeworkId: req.params.id, studentId: student._id },
      { content: req.body.content, status: isLate ? 'late' : 'submitted', submittedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    const { grade, remarks } = req.body;
    const submission = await HomeworkSubmission.findByIdAndUpdate(
      req.params.submissionId,
      { grade, remarks, status: 'graded' },
      { new: true }
    );
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    res.json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

// GET /api/homework/my-assigned?classId= — staff: homework they assigned, with submission counts
export const getMyAssignedHomework = async (req, res, next) => {
  try {
    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const filter = { assignedBy: staff._id };
    if (req.query.classId) filter.classId = req.query.classId;

    const homework = await Homework.find(filter)
      .populate('classId', 'name section')
      .sort({ createdAt: -1 });

    const withCounts = await Promise.all(homework.map(async (hw) => {
      const submissionCount = await HomeworkSubmission.countDocuments({ homeworkId: hw._id });
      return { ...hw.toObject(), submissionCount };
    }));

    res.json({ success: true, data: withCounts });
  } catch (err) { next(err); }
};

export const getMyHomework = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    console.log(student, "studenttt")
    const homework = await Homework.find({ classId: student.classId, status: 'active' })
      .populate({ path: 'assignedBy', populate: { path: 'userId', select: 'name' } })
      .sort({ dueDate: 1 });
    console.log(homework, "homework")
    const submissions = await HomeworkSubmission.find({
      studentId: student._id,
      homeworkId: { $in: homework.map(h => h._id) }
    });

    const submissionMap = {};
    submissions.forEach(s => { submissionMap[s.homeworkId.toString()] = s; });

    const result = homework.map(h => ({
      ...h.toObject(),
      submission: submissionMap[h._id.toString()] || null,
    }));
    console.log(result, "resultt")
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
