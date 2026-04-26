import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import StaffAttendance from '../models/StaffAttendance.js';
import Leave from '../models/Leave.js';
import Timetable from '../models/Timetable.js';
import PeriodConfig from '../models/PeriodConfig.js';
import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import Substitution from '../models/Substitution.js';
import ClassMapping from '../models/ClassMapping.js';
import Notification from '../models/Notification.js';
import { sendMail } from '../utils/mailer.js';

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
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const academicYear = currentMonth >= 5 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

    const mapping = await ClassMapping.findOne({
      classId: req.params.classId,
      academicYear
    }).populate({
      path: 'students',
      populate: { path: 'userId', select: 'name email' }
    });

    if (mapping && mapping.students && mapping.students.length > 0) {
      return res.json({ success: true, data: mapping.students });
    }

    // Fallback to older direct Student collection if no mapping
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
          { ...r, markedBy: staff._id, schoolId: req.user.schoolId },
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
    const grade = await Grade.create({ ...req.body, schoolId: req.user.schoolId });
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
    const filter = { staffId: staff._id };
    if (req.query.classId) filter.classId = req.query.classId;
    const subjects = await Subject.find(filter).populate('classId', 'name section');
    res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
};

export const getStaffProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const staff = await Staff.findOne({ userId })
      .populate('userId', 'name email')
      .populate('classesAssigned', 'name section');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const markStaffAbsent = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const staff = await Staff.findOne({ _id: staffId, schoolId: req.user.schoolId });
    if (!staff) return res.status(404).json({ success: false, message: 'Teacher not found' });

    await StaffAttendance.findOneAndUpdate(
      { staffId, date: targetDate },
      { $set: { staffId, schoolId: req.user.schoolId, date: targetDate, status: 'absent' } },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Teacher marked as absent' });
  } catch (err) {
    next(err);
  }
};

export const getAbsentStaff = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date is required' });

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const records = await StaffAttendance.find({
      schoolId: req.user.schoolId,
      date: { $gte: d, $lt: nextDay },
      status: 'absent',
    }).populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } });

    const data = records
      .filter(r => r.staffId)
      .map(r => ({
        _id: r.staffId._id,
        name: r.staffId.userId?.name || r.staffId.employeeId || 'Unknown',
        employeeId: r.staffId.employeeId || '',
      }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find({ status: 'active', schoolId: req.user.schoolId })
      .populate('userId', 'name email');
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const getApprovers = async (req, res, next) => {
  try {
    // Get all active staff
    const staff = await Staff.find({ status: 'active', schoolId: req.user.schoolId })
      .populate('userId', 'name email');

    // Get all admin users
    const admins = await User.find({ role: 'admin', schoolId: req.user.schoolId })
      .select('_id name email');

    // Format staff data for approvers
    const staffApprovers = staff.map(s => ({
      _id: s.userId._id,
      name: s.userId.name,
      email: s.userId.email,
      type: 'staff'
    }));

    // Format admin data
    const adminApprovers = admins.map(a => ({
      _id: a._id,
      name: a.name,
      email: a.email,
      type: 'admin'
    }));

    // Combine and remove duplicates
    const allApprovers = [...staffApprovers, ...adminApprovers];
    const uniqueApprovers = Array.from(new Map(allApprovers.map(item => [item._id.toString(), item])).values());

    res.json({ success: true, data: uniqueApprovers });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    // Get user with passwordHash
    const user = await User.findById(req.user.userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash and update new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { contact, qualification, qualificationDegree, qualificationSpecialization, experience } = req.body;

    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff profile not found' });
    }

    // Update allowed fields
    if (contact !== undefined) staff.contact = contact;
    if (qualification !== undefined) staff.qualification = qualification;
    if (qualificationDegree !== undefined) staff.qualificationDegree = qualificationDegree;
    if (qualificationSpecialization !== undefined) staff.qualificationSpecialization = qualificationSpecialization;
    if (experience !== undefined) staff.experience = experience;

    const updated = await staff.save();
    const result = await Staff.findById(updated._id)
      .populate('userId', 'name email')
      .populate('classesAssigned', 'name section');

    res.json({ success: true, data: result, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const staffCheckIn = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInTime = new Date();
    const status = checkInTime.getHours() < 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() < 15) ? 'present' : 'late';

    const record = await StaffAttendance.findOneAndUpdate(
      { staffId: staff._id, date: today },
      { checkIn: checkInTime, status },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const staffCheckOut = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await StaffAttendance.findOne({ staffId: staff._id, date: today });
    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, message: 'Check in first before check out' });
    }

    const checkOutTime = new Date();
    const workingMinutes = Math.floor((checkOutTime - record.checkIn) / 60000);

    const updated = await StaffAttendance.findByIdAndUpdate(
      record._id,
      { checkOut: checkOutTime, workingHours: workingMinutes },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const getStaffAttendanceToday = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await StaffAttendance.findOne({ staffId: staff._id, date: today });
    res.json({ success: true, data: record || null });
  } catch (err) {
    next(err);
  }
};

export const getStaffAttendanceHistory = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const records = await StaffAttendance.find({
      staffId: staff._id,
      date: { $gte: sevenDaysAgo, $lte: today }
    }).sort({ date: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason, approvers } = req.body;

    if (!leaveType || !startDate || !endDate || !reason || !approvers || approvers.length === 0) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const staff = await getStaffProfile(req.user.userId);

    // Prepare approvers with names
    const approverList = await Promise.all(
      approvers.map(async (userId) => {
        const user = await User.findById(userId).select('name');
        return { userId, name: user?.name || 'Unknown', approved: null };
      })
    );

    const leave = await Leave.create({
      staffId: staff._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      approvers: approverList,
      status: 'pending',
      schoolId: req.user.schoolId,
    });

    // Notify all approvers via Message model
    try {
      const messages = approvers.map(approverId => ({
        fromUserId: req.user.userId,
        toUserId: approverId,
        content: `New ${leaveType} leave request from ${staff.userId?.name || 'Staff'}. Start: ${new Date(startDate).toLocaleDateString()}. Reason: ${reason}. Please review your Pending Approvals.`,
      }));
      if (messages.length > 0) {
        // Need to import Message if not already there, ensure it's available
        await mongoose.model('Message').insertMany(messages);
      }
      // Also push bell notifications to approvers
      const notifDocs = approvers.map(approverId => ({
        userId: approverId,
        title: `Leave Request from ${staff.userId?.name || 'Staff'}`,
        message: `${leaveType} leave requested from ${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}. Reason: ${reason}`,
        type: 'warning',
      }));
      if (notifDocs.length > 0) await Notification.insertMany(notifDocs);
    } catch (msgErr) {
      console.error('Failed to send notification messages:', msgErr);
      // Suppress error so leave creation still succeeds
    }

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const leaves = await Leave.find({ staffId: staff._id })
      .sort({ appliedOn: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

export const getLeaveBalance = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Count used leaves
    const casualLeaves = await Leave.countDocuments({
      staffId: staff._id,
      leaveType: 'casual',
      startDate: { $gte: yearStart, $lte: yearEnd },
      status: 'approved'
    });

    const sickLeaves = await Leave.countDocuments({
      staffId: staff._id,
      leaveType: 'sick',
      startDate: { $gte: yearStart, $lte: yearEnd },
      status: 'approved'
    });

    const balance = {
      casual: { total: 15, used: casualLeaves, remaining: 15 - casualLeaves },
      sick: { total: 5, used: sickLeaves, remaining: 5 - sickLeaves }
    };

    res.json({ success: true, data: balance });
  } catch (err) {
    next(err);
  }
};

export const getStaffTimetable = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    // Academic year: June onwards = current year, before June = previous year
    const academicYear = currentMonth >= 5 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

    // Find all PeriodConfigs where this staff is assigned as teacher in any period
    const periodConfigs = await PeriodConfig.find({
      academicYear,
      'periods.teacher': staff._id
    }).populate('classId', 'name section');

    // For each config, build schedule grouped by day with full period info
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = periodConfigs.map((config) => {
      const schedule = {};
      DAYS.forEach((day) => {
        const dayPeriods = (config.periods || [])
          .map((p) => p.toObject?.() || p)
          .filter((p) => p.day === day);
        if (dayPeriods.length > 0) {
          schedule[day] = dayPeriods.map((p) => ({
            name: p.name || '',
            startTime: p.startTime || '',
            endTime: p.endTime || '',
            type: p.type || 'class',
            subject: p.subject || '',
            teacher: p.teacher || null,
          }));
        }
      });
      return {  
        classId: config.classId._id,
        className: config.classId.name,
        section: config.classId.section,
        schedule,
        periods: config.periods || []
      };
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/staff/timetable-assignments
// Returns classes the staff teaches + subjects per class derived from PeriodConfig
// GET /api/staff/my-academic-classes
// Returns all classes the staff is associated with — homeroom (classesAssigned) + subject teacher (timetable)
export const getMyAcademicClasses = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const academicYear = currentMonth >= 5 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

    // 1. Homeroom classes from classesAssigned
    const homeroomClasses = await Class.find({ _id: { $in: staff.classesAssigned || [] } }).lean();

    // 2. Classes from timetable where this staff teaches
    const periodConfigs = await PeriodConfig.find({
      academicYear,
      'periods.teacher': staff._id,
    }).populate('classId', 'name section');

    const timetableClasses = periodConfigs
      .filter(pc => pc.classId)
      .map(pc => ({ _id: pc.classId._id.toString(), name: pc.classId.name, section: pc.classId.section }));

    // 3. Merge and deduplicate by _id
    const classMap = new Map();
    homeroomClasses.forEach(c => classMap.set(c._id.toString(), { _id: c._id, name: c.name, section: c.section }));
    timetableClasses.forEach(c => { if (!classMap.has(c._id)) classMap.set(c._id, { _id: c._id, name: c.name, section: c.section }); });

    res.json({ success: true, data: Array.from(classMap.values()) });
  } catch (err) {
    next(err);
  }
};

export const getTimetableAssignments = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const academicYear = currentMonth >= 5 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;
    const staffIdStr = staff._id.toString();

    // Map: classId string -> { classId object, subjects: Set }
    const assignmentMap = new Map();

    // 1. From PeriodConfig (timetable schedule)
    const periodConfigs = await PeriodConfig.find({
      academicYear,
      'periods.teacher': staff._id,
    }).populate('classId', 'name section');

    periodConfigs.forEach((config) => {
      if (!config.classId) return;
      const cIdStr = config.classId._id.toString();
      const subjects = (config.periods || [])
        .filter(p => p.teacher?.toString() === staffIdStr && p.subject)
        .map(p => p.subject);
      if (!assignmentMap.has(cIdStr)) {
        assignmentMap.set(cIdStr, { classId: config.classId, subjects: new Set() });
      }
      subjects.forEach(s => assignmentMap.get(cIdStr).subjects.add(s));
    });

    // 2. From ClassMapping (class teacher + subject teachers)
    const classMappings = await ClassMapping.find({
      schoolId: req.user.schoolId,
      academicYear,
    }).populate('classId', 'name section');

    const classTeacherSet = new Set();

    classMappings.forEach((mapping) => {
      if (!mapping.classId) return;
      const cIdStr = mapping.classId._id.toString();
      const mappingSubjects = [];

      // Subject teacher assignments
      if (mapping.subjectTeachers) {
        for (const [subject, teacherId] of mapping.subjectTeachers) {
          if (String(teacherId) === staffIdStr) {
            mappingSubjects.push(subject);
          }
        }
      }

      // Class teacher or subject teacher in this mapping
      const isClassTeacher = mapping.classTeacher?.toString() === staffIdStr;
      if (isClassTeacher) classTeacherSet.add(cIdStr);
      if (!isClassTeacher && mappingSubjects.length === 0) return;

      if (!assignmentMap.has(cIdStr)) {
        assignmentMap.set(cIdStr, { classId: mapping.classId, subjects: new Set() });
      }
      mappingSubjects.forEach(s => assignmentMap.get(cIdStr).subjects.add(s));
    });

    const assignments = Array.from(assignmentMap.values()).map(a => ({
      classId: a.classId,
      academicYear,
      subjects: Array.from(a.subjects),
      isClassTeacher: classTeacherSet.has(a.classId._id.toString()),
    }));

    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
};

export const getStaffSubstitutions = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const substitutions = await Substitution.find({
      substituteTeacherId: staff._id,
      date: { $gte: today }
    })
      .populate('classId', 'name section')
      .populate('originalTeacherId', 'userId')
      .populate('originalTeacherId.userId', 'name')
      .sort({ date: 1 })
      .limit(20);

    res.json({ success: true, data: substitutions });
  } catch (err) {
    next(err);
  }
};

export const getPendingApprovals = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const leaves = await Leave.find({
      'approvers.userId': userId,
      status: 'pending',
    })
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name email' } })
      .sort({ appliedOn: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

export const getAllLeaveRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { schoolId: req.user.schoolId };
    if (status) filter.status = status;
    const leaves = await Leave.find(filter)
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } })
      .sort({ appliedOn: -1 });
    res.json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

export const approveRejectLeave = async (req, res, next) => {
  try {
    const { leaveId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const userId = req.user.userId;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const isAdmin = req.user.role === 'admin';

    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    if (!isAdmin) {
      const approverIdx = leave.approvers.findIndex(a => a.userId.toString() === userId.toString());
      if (approverIdx === -1) {
        return res.status(403).json({ success: false, message: 'You are not an approver for this leave' });
      }
      leave.approvers[approverIdx].approved = action === 'approve';
    }

    if (action === 'reject') {
      leave.status = 'rejected';
    } else {
      const allApproved = isAdmin || leave.approvers.every(a => a.approved === true);
      if (allApproved) {
        leave.status = 'approved';
        // Auto-mark absent for every day in the leave range
        const ops = [];
        const cursor = new Date(leave.startDate);
        cursor.setHours(0, 0, 0, 0);
        const endDay = new Date(leave.endDate);
        endDay.setHours(0, 0, 0, 0);
        while (cursor <= endDay) {
          const day = new Date(cursor);
          ops.push({
            updateOne: {
              filter: { staffId: leave.staffId, date: day },
              update: { $set: { staffId: leave.staffId, schoolId: leave.schoolId, date: day, status: 'absent' } },
              upsert: true,
            },
          });
          cursor.setDate(cursor.getDate() + 1);
        }
        if (ops.length > 0) await StaffAttendance.bulkWrite(ops).catch(() => {});
      }
    }

    await leave.save();

    // Notify the staff member of the decision
    try {
      const staffDoc = await Staff.findById(leave.staffId).select('userId');
      if (staffDoc?.userId) {
        const decision = action === 'approve' ? 'approved' : 'rejected';
        const notifTitle = `Leave ${decision.charAt(0).toUpperCase() + decision.slice(1)}`;
        const notifMsg = `Your ${leave.leaveType} leave request has been ${decision}.`;

        await Notification.create({
          userId: staffDoc.userId,
          title: notifTitle,
          message: notifMsg,
          type: action === 'approve' ? 'success' : 'error',
        });

        if (action === 'approve') {
          const userDoc = await User.findById(staffDoc.userId).select('name email');
          if (userDoc?.email) {
            const startStr = new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const endStr = new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            sendMail({
              fromEmail: process.env.SMTP_USER,
              fromName: process.env.SMTP_FROM_NAME || 'School Management',
              to: [userDoc.email],
              subject: 'Your Leave Request Has Been Approved',
              text: `Dear ${userDoc.name},\n\nYour ${leave.leaveType} leave request from ${startStr} to ${endStr} has been approved.\n\nReason you submitted: ${leave.reason}\n\nPlease ensure your work responsibilities are covered during your absence.\n\nRegards,\nSchool Management`,
            }).catch(() => {});
          }
        }
      }
    } catch { /* non-critical */ }

    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

export const getStaffExamDuties = async (req, res, next) => {
  try {
    const staff = await getStaffProfile(req.user.userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const examDuties = await Exam.find({
      invigilatorId: staff._id,
      date: { $gte: today }
    })
      .populate('classId', 'name section')
      .sort({ date: 1 });

    res.json({ success: true, data: examDuties });
  } catch (err) {
    next(err);
  }
};

export const sendMarksReport = async (req, res, next) => {
  try {
    const { classId, examId } = req.body;
    if (!classId || !examId) {
      return res.status(400).json({ success: false, message: 'classId and examId are required' });
    }

    const staff = await getStaffProfile(req.user.userId);
    const staffIdStr = staff._id.toString();
    const staffUser = await User.findById(req.user.userId).select('name');
    const staffName = staffUser?.name || 'Class Teacher';

    const currentYear = new Date().getFullYear();
    const academicYear = new Date().getMonth() >= 5
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;

    // Verify staff is the class teacher
    const mapping = await ClassMapping.findOne({ classId, schoolId: req.user.schoolId, academicYear });
    if (!mapping || mapping.classTeacher?.toString() !== staffIdStr) {
      return res.status(403).json({ success: false, message: 'Only the class teacher can send reports to parents' });
    }

    const exam = await Exam.findById(examId).populate('classId', 'name section');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const results = await ExamResult.find({ examId }).populate({
      path: 'studentId',
      select: 'userId parentId rollNumber',
      populate: [
        { path: 'userId', select: 'name' },
        { path: 'parentId', populate: { path: 'userId', select: 'email name' } },
      ],
    });

    const className = exam.classId?.name || '';
    const classSection = exam.classId?.section || '';
    const maxScore = exam.maxScore || 100;

    let sent = 0;
    let noEmail = 0;

    for (const result of results) {
      const student = result.studentId;
      const studentName = student?.userId?.name || 'Student';
      const parentEmail = student?.parentId?.userId?.email;

      if (!parentEmail) { noEmail++; continue; }

      const pct = ((result.marks / maxScore) * 100).toFixed(1);

      await sendMail({
        fromEmail: process.env.SMTP_USER,
        fromName: process.env.SMTP_FROM_NAME || 'School Management System',
        to: [parentEmail],
        subject: `${exam.examType} Results — ${studentName} | ${className} ${classSection}`,
        text: `Dear Parent/Guardian,

We are sharing the ${exam.examType} exam results for your child.

Student Name : ${studentName}
Class        : ${className} - ${classSection}
Subject      : ${exam.subject}
Exam Type    : ${exam.examType}
Marks        : ${result.marks} / ${maxScore}
Percentage   : ${pct}%
Grade        : ${result.grade || '-'}

If you have any questions, please contact the class teacher.

Regards,
${staffName}
Class Teacher — ${className} ${classSection}`,
      }).then(() => { sent++; }).catch(() => {});
    }

    res.json({ success: true, data: { sent, noEmail, total: results.length } });
  } catch (err) {
    next(err);
  }
};
