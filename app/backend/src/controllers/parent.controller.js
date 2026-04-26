import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import ExamResult from '../models/ExamResult.js';
import Attendance from '../models/Attendance.js';
import FeeRecord from '../models/FeeRecord.js';

const getParentProfile = async (userId) => {
  const parent = await Parent.findOne({ userId });
  if (!parent) throw Object.assign(new Error('Parent profile not found'), { status: 404 });
  return parent;
};

const assertChildOwnership = async (parent, childId) => {
  const child = await Student.findById(childId);
  if (!child || !parent.children.map(String).includes(String(child._id))) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }
  return child;
};

export const getChildren = async (req, res, next) => {
  try {
    const parent = await getParentProfile(req.user.userId);
    const children = await Student.find({ _id: { $in: parent.children } })
      .populate('userId', 'name email')
      .populate('classId', 'name section gradeLevel');
    res.json({ success: true, data: children });
  } catch (err) {
    next(err);
  }
};

export const getChildGrades = async (req, res, next) => {
  try {
    const parent = await getParentProfile(req.user.userId);
    await assertChildOwnership(parent, req.params.childId);
    const results = await ExamResult.find({ studentId: req.params.childId })
      .populate('examId', 'subject examType maxScore date')
      .sort({ createdAt: 1 });
    const grades = results.map(r => ({
      _id: r._id,
      subjectId: { name: r.examId?.subject || '—' },
      marks: r.marks,
      totalMarks: r.examId?.maxScore || 100,
      grade: r.grade,
      term: r.examId?.examType || '—',
    }));
    res.json({ success: true, data: grades });
  } catch (err) {
    next(err);
  }
};

export const getChildAttendance = async (req, res, next) => {
  try {
    const parent = await getParentProfile(req.user.userId);
    await assertChildOwnership(parent, req.params.childId);
    const records = await Attendance.find({ studentId: req.params.childId }).sort({ date: -1 });
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    res.json({ success: true, data: { records, summary: { total, present, absent: total - present } } });
  } catch (err) {
    next(err);
  }
};

export const getChildFees = async (req, res, next) => {
  try {
    const parent = await getParentProfile(req.user.userId);
    await assertChildOwnership(parent, req.params.childId);
    const fees = await FeeRecord.find({ studentId: req.params.childId }).sort({ dueDate: -1 });
    const totalDue = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);
    res.json({ success: true, data: { fees, summary: { totalDue } } });
  } catch (err) {
    next(err);
  }
};
