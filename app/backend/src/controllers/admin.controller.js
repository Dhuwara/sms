import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Parent from '../models/Parent.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import FeeRecord from '../models/FeeRecord.js';

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total_students, total_classes, total_teachers, total_staff, pending_fees, presentToday, absentToday] =
      await Promise.all([
        Student.countDocuments(),
        Class.countDocuments(),
        Staff.countDocuments(),
        User.countDocuments({ role: 'staff' }),
        FeeRecord.countDocuments({ status: { $in: ['pending', 'overdue'] } }),
        Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'present' }),
        Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'absent' }),
      ]);

    res.json({
      success: true,
      data: {
        total_students,
        total_classes,
        total_teachers,
        total_staff,
        pending_fees,
        present_today: presentToday,
        absent_today: absentToday,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role });

    if (role === 'staff') await Staff.create({ userId: user._id });
    if (role === 'student') await Student.create({ userId: user._id });
    if (role === 'parent') await Parent.create({ userId: user._id });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (password) update.passwordHash = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Staff.deleteOne({ userId: req.params.id });
    await Student.deleteOne({ userId: req.params.id });
    await Parent.deleteOne({ userId: req.params.id });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Classes ─────────────────────────────────────────────────────────────────

export const getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find().populate({ path: 'staffId', populate: { path: 'userId', select: 'name email' } });
    res.json({ success: true, data: classes });
  } catch (err) {
    next(err);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, data: cls });
  } catch (err) {
    next(err);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err) {
    next(err);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Subjects ────────────────────────────────────────────────────────────────

export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find()
      .populate('classId', 'name section')
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } });
    res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, description, classId, staffId } = req.body;
    const subject = await Subject.create({
      name,
      code: code || '',
      description: description || '',
      classId: classId || undefined,
      staffId: staffId || undefined,
    });
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (code !== undefined) update.code = code;
    if (description !== undefined) update.description = description;
    const subject = await Subject.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const getAttendanceReport = async (req, res, next) => {
  try {
    const report = await Attendance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = await Attendance.countDocuments();
    res.json({ success: true, data: { breakdown: report, total } });
  } catch (err) {
    next(err);
  }
};

export const getFeeReport = async (req, res, next) => {
  try {
    const report = await FeeRecord.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};
