import StudentLeave from '../models/StudentLeave.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Class from '../models/Class.js';
import Staff from '../models/Staff.js';

// @desc    Student applies for leave
// @route   POST /api/student-leaves/apply
// @access  Private (Student)
export const applyLeave = async (req, res, next) => {
  try {
    const { startDate, endDate, reason, leaveType } = req.body;

    // Find student record for the logged in user
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    if (!student.parentId) {
      return res.status(400).json({ success: false, message: 'No parent linked to student' });
    }

    if (!student.classId) {
      return res.status(400).json({ success: false, message: 'No class linked to student' });
    }

    // Find class teacher
    const classInfo = await Class.findById(student.classId);
    if (!classInfo || !classInfo.staffId) {
      return res.status(400).json({ success: false, message: 'Class teacher not assigned' });
    }

    const leave = await StudentLeave.create({
      studentId: student._id,
      parentId: student.parentId,
      classId: student.classId,
      staffId: classInfo.staffId,
      startDate,
      endDate,
      reason,
      leaveType,
      status: 'pending_parent'
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own leave requests
// @route   GET /api/student-leaves/my-leaves
// @access  Private (Student)
export const getMyStudentLeaves = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    const leaves = await StudentLeave.find({ studentId: student._id }).sort({ appliedOn: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending leave requests for a parent's children
// @route   GET /api/student-leaves/parent/pending
// @access  Private (Parent)
export const getParentPendingLeaves = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ userId: req.user.userId });
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent record not found' });
    }

    const leaves = await StudentLeave.find({
      parentId: parent._id,
      'parentApproval.status': 'pending'
    }).populate('studentId', 'userId').populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name' }
    }).sort({ appliedOn: -1 });

    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

// @desc    Parent approves or denies leave
// @route   PUT /api/student-leaves/parent/action/:id
// @access  Private (Parent)
export const parentAction = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const leave = await StudentLeave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Verify parent is authorized
    const parent = await Parent.findOne({ userId: req.user.userId });
    if (!parent || leave.parentId.toString() !== parent._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    leave.parentApproval.status = action === 'approve' ? 'approved' : 'denied';
    leave.parentApproval.reason = reason || '';
    leave.parentApproval.updatedAt = Date.now();

    if (action === 'approve') {
      leave.status = 'pending_staff';
    } else {
      leave.status = 'denied';
    }

    await leave.save();
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending leave requests for a class teacher (only parent-approved)
// @route   GET /api/student-leaves/staff/pending
// @access  Private (Staff)
export const getStaffPendingLeaves = async (req, res, next) => {
  try {
    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff record not found' });
    }

    const leaves = await StudentLeave.find({
      staffId: staff._id,
      status: 'pending_staff'
    }).populate('studentId', 'userId').populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name' }
    }).sort({ appliedOn: -1 });

    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

// @desc    Staff approves or denies leave
// @route   PUT /api/student-leaves/staff/action/:id
// @access  Private (Staff)
export const staffAction = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const leave = await StudentLeave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Verify staff is authorized
    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff || leave.staffId.toString() !== staff._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    leave.staffApproval.status = action === 'approve' ? 'approved' : 'denied';
    leave.staffApproval.reason = reason || '';
    leave.staffApproval.updatedAt = Date.now();

    if (action === 'approve') {
      leave.status = 'approved';
    } else {
      leave.status = 'denied';
    }

    await leave.save();
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};
