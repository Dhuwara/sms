import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js';
import Subject from '../models/Subject.js';
import FeeRecord from '../models/FeeRecord.js';

const getStudentProfile = async (userId) => {
  const student = await Student.findOne({ userId }).populate('classId');
  if (!student) throw Object.assign(new Error('Student profile not found'), { status: 404 });
  return student;
};

export const getMyGrades = async (req, res, next) => {
  try {
    const student = await getStudentProfile(req.user.userId);
    const grades = await Grade.find({ studentId: student._id })
      .populate('subjectId', 'name')
      .sort({ term: 1 });
    res.json({ success: true, data: grades });
  } catch (err) {
    next(err);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const student = await getStudentProfile(req.user.userId);
    const records = await Attendance.find({ studentId: student._id }).sort({ date: -1 });
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    res.json({ success: true, data: { records, summary: { total, present, absent, late } } });
  } catch (err) {
    next(err);
  }
};

export const getMySchedule = async (req, res, next) => {
  try {
    const student = await getStudentProfile(req.user.userId);
    console.log(student,"studeennn")
    const subjects = await Subject.find({ classId: student.classId })
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } });
    res.json({ success: true, data: { class: student.classId, subjects } });
  } catch (err) {
    next(err);
  }
};

export const getMyFees = async (req, res, next) => {
  try {
    const student = await getStudentProfile(req.user.userId);
    const fees = await FeeRecord.find({ studentId: student._id }).sort({ dueDate: -1 });
    const totalDue = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    res.json({ success: true, data: { fees, summary: { totalDue, totalPaid } } });
  } catch (err) {
    next(err);
  }
};

export const getMyInfo = async(req,res,next)=>{
  const student = await getStudentProfile(req.user.userId);
  console.log(student,"studenenene")
  res.json({ success: true, data: {student} });
}
