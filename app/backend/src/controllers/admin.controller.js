import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Parent from '../models/Parent.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import StaffAttendance from '../models/StaffAttendance.js';
import FeeRecord from '../models/FeeRecord.js';
import FeeStructure from '../models/FeeStructure.js';
import StudentFeePayment from '../models/StudentFeePayment.js';
import ClassMapping from '../models/ClassMapping.js';
import Leave from '../models/Leave.js';

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schoolId = req.user.schoolId;
    const [
      total_students, total_classes, total_teachers, total_staff, pending_fees,
      studentPresentToday, studentAbsentToday,
      staffPresentToday, staffLateToday, staffAbsentToday,
    ] = await Promise.all([
      Student.countDocuments({ schoolId }),
      Class.countDocuments({ schoolId }),
      Staff.countDocuments({ schoolId }),
      User.countDocuments({ role: 'staff', schoolId }),
      StudentFeePayment.countDocuments({ schoolId, status: 'pending' }),
      Attendance.countDocuments({ schoolId, date: { $gte: today, $lt: tomorrow }, status: 'present' }),
      Attendance.countDocuments({ schoolId, date: { $gte: today, $lt: tomorrow }, status: 'absent' }),
      StaffAttendance.countDocuments({ schoolId, date: { $gte: today, $lt: tomorrow }, status: 'present' }),
      StaffAttendance.countDocuments({ schoolId, date: { $gte: today, $lt: tomorrow }, status: 'late' }),
      StaffAttendance.countDocuments({ schoolId, date: { $gte: today, $lt: tomorrow }, status: 'absent' }),
    ]);

    // ── Fee Collection Summary ──────────────────────────────────────────────
    // Calculate total expected fees across all fee structures × enrolled students
    let fee_total_expected = 0;
    let fee_total_collected = 0;
    let fee_total_pending = 0;
    let fee_total_overdue = 0;

    // Roman numeral → Arabic for grades 1–12
    const ROMAN = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 };
    const parseGradePart = (part) => {
      const up = part.toUpperCase();
      if (ROMAN[up] !== undefined) return String(ROMAN[up]);
      if (/^\d+$/.test(part)) return part;
      return part;
    };
    const normalizeStandard = (className) => {
      const parts = className.trim().split(/\s+/);
      if (parts.length >= 2 && parts[0].toLowerCase() === 'grade') return parseGradePart(parts[1]);
      return parts[0];
    };

    const feeStructures = await FeeStructure.find({ schoolId });
    if (feeStructures.length > 0) {
      // For each fee structure, count how many students are in that standard
      const classMappings = await ClassMapping.find({ schoolId }).populate('classId', 'name section');

      for (const fs of feeStructures) {
        // Find classes that match this standard (normalize class name the same way)
        const matchingMappings = classMappings.filter(cm => {
          const className = cm.classId?.name || '';
          const normalized = normalizeStandard(className);
          return normalized === fs.standard;
        });

        const studentCount = matchingMappings.reduce((sum, cm) => sum + (cm.students?.length || 0), 0);
        fee_total_expected += fs.totalFees * studentCount;
      }

      // Aggregate paid amounts from StudentFeePayment
      const paymentAgg = await StudentFeePayment.aggregate([
        { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
          },
        },
      ]);

      for (const item of paymentAgg) {
        if (item._id === 'paid') fee_total_collected += item.total;
        if (item._id === 'pending') fee_total_pending += item.total;
      }

      // If no StudentFeePayment records, fall back to FeeRecord
      if (paymentAgg.length === 0) {
        const feeRecordAgg = await FeeRecord.aggregate([
          { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
          {
            $group: {
              _id: '$status',
              total: { $sum: '$amount' },
            },
          },
        ]);
        for (const item of feeRecordAgg) {
          if (item._id === 'paid') fee_total_collected += item.total;
          if (item._id === 'pending') fee_total_pending += item.total;
          if (item._id === 'overdue') fee_total_overdue += item.total;
        }
      }

      // Overdue = expected - collected - pending (if not already tracked)
      if (fee_total_overdue === 0 && fee_total_expected > 0) {
        fee_total_overdue = Math.max(0, fee_total_expected - fee_total_collected - fee_total_pending);
      }
    }

    res.json({
      success: true,
      data: {
        total_students,
        total_classes,
        total_teachers,
        total_staff,
        pending_fees,
        student_present_today: studentPresentToday,
        student_absent_today: studentAbsentToday,
        staff_present_today: staffPresentToday,
        staff_late_today: staffLateToday,
        staff_absent_today: staffAbsentToday,
        fee_total_expected,
        fee_total_collected,
        fee_total_pending,
        fee_total_overdue,
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
    const schoolId = req.user.schoolId;
    const filter = { schoolId };
    if (role) filter.role = role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const schoolId = req.user.schoolId;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role, schoolId });

    if (role === 'staff') await Staff.create({ userId: user._id, schoolId });
    if (role === 'student') await Student.create({ userId: user._id, schoolId });
    if (role === 'parent') await Parent.create({ userId: user._id, schoolId });

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
    const classes = await Class.find({ schoolId: req.user.schoolId }).populate({ path: 'staffId', populate: { path: 'userId', select: 'name email' } });
    res.json({ success: true, data: classes });
  } catch (err) {
    next(err);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const cls = await Class.create({ ...req.body, schoolId: req.user.schoolId });
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
    const subjects = await Subject.find({ schoolId: req.user.schoolId })
      .populate('classId', 'name section')
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } });
    res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const schoolId = req.user.schoolId;
    const { name, code, description, standard, classId, staffId } = req.body;
    if (code) {
      const existing = await Subject.findOne({ code: code.trim(), schoolId });
      if (existing) {
        return res.status(400).json({ success: false, message: `Subject with code "${code.trim()}" already exists` });
      }
    }
    const subject = await Subject.create({
      schoolId,
      name,
      code: code || '',
      description: description || '',
      standard: standard || '',
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
    const { name, code, description, standard } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (code !== undefined) update.code = code;
    if (description !== undefined) update.description = description;
    if (standard !== undefined) update.standard = standard;
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
    const schoolId = req.user.schoolId;
    const report = await Attendance.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = await Attendance.countDocuments({ schoolId });
    res.json({ success: true, data: { breakdown: report, total } });
  } catch (err) {
    next(err);
  }
};

export const getFeeReport = async (req, res, next) => {
  try {
    const schoolId = req.user.schoolId;
    const report = await FeeRecord.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// ─── Leave Approvals ────────────────────────────────────────────────────────

export const getPendingLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ status: 'pending', schoolId: req.user.schoolId })
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name email' } })
      .sort({ appliedOn: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

export const adminApproveRejectLeave = async (req, res, next) => {
  try {
    const { leaveId } = req.params;
    const { action, rejectionReason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    leave.status = action === 'approve' ? 'approved' : 'rejected';
    if (action === 'reject') {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();
    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};
