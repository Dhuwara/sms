import Staff from '../models/Staff.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';

const getStaffProfile = async (userId) => {
  const staff = await Staff.findOne({ userId });
  if (!staff) throw Object.assign(new Error('Staff profile not found'), { status: 404 });
  return staff;
};

export const getMyClasses = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const classes = await Class.find({ _id: { $in: staff.classesAssigned } });
    res.json({ success: true, data: classes });
  } catch (err) {
    next(err);
  }
};

export const getStudentsByClass = async (req, res, next) => {
  try {
    const students = await Student.find({ classId: req.params.classId })
      .populate('userId', 'name email');
    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};

export const getAttendance = async (req, res, next) => {
  try {
    const { classId, date } = req.query;
    const filter = {};
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }
    if (classId) {
      const students = await Student.find({ classId }).select('_id');
      filter.studentId = { $in: students.map(s => s._id) };
    }
    const records = await Attendance.find(filter)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } });
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const { records } = req.body; // [{ studentId, date, status }]
    const saved = await Promise.all(
      records.map(r =>
        Attendance.findOneAndUpdate(
          { studentId: r.studentId, date: new Date(r.date) },
          { ...r, markedBy: staff._id },
          { upsert: true, new: true }
        )
      )
    );
    res.json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const getGrades = async (req, res, next) => {
  try {
    const { classId, subjectId } = req.query;
    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (classId) {
      const students = await Student.find({ classId }).select('_id');
      filter.studentId = { $in: students.map(s => s._id) };
    }
    const grades = await Grade.find(filter)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate('subjectId', 'name');
    res.json({ success: true, data: grades });
  } catch (err) {
    next(err);
  }
};

export const createGrade = async (req, res, next) => {
  try {
    const grade = await Grade.create(req.body);
    res.status(201).json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

export const updateGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
    res.json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

export const getSubjects = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const subjects = await Subject.find({ staffId: staff._id }).populate('classId', 'name section');
    res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};
