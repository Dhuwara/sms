import OnlineClass from '../models/OnlineClass.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

// @desc    Create an online class
// @route   POST /api/online-classes
// @access  Private (Staff/Admin)
export const createOnlineClass = async (req, res, next) => {
  try {
    let staffId = null;
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ userId: req.user.userId });
      if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });
      staffId = staff._id;
    } else {
      // Allow admin to assign staffId or default to a dummy if required (or make it optional based on business logic)
      staffId = req.body.staffId;
    }

    const onlineClass = await OnlineClass.create({
      ...req.body,
      staffId,
    });

    res.status(201).json({ success: true, data: onlineClass });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all online classes for a specific class
// @route   GET /api/online-classes/class/:classId
// @access  Private (Staff/Admin)
export const getOnlineClasses = async (req, res, next) => {
  try {
    const onlineClasses = await OnlineClass.find({ classId: req.params.classId })
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } })
      .sort({ date: 1, time: 1 });
      
    res.json({ success: true, data: onlineClasses });
  } catch (err) {
    next(err);
  }
};

// @desc    Get online classes for logged in student
// @route   GET /api/online-classes/my-classes
// @access  Private (Student)
export const getMyOnlineClasses = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const myClasses = await OnlineClass.find({ classId: student.classId })
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name' } })
      .sort({ date: 1, time: 1 });

    res.json({ success: true, data: myClasses });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an online class
// @route   DELETE /api/online-classes/:id
// @access  Private (Staff/Admin)
export const deleteOnlineClass = async (req, res, next) => {
  try {
    const onlineClass = await OnlineClass.findById(req.params.id);
    if (!onlineClass) {
      return res.status(404).json({ success: false, message: 'Online class not found' });
    }

    // Role-based authorization - optional but good practice
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ userId: req.user.userId });
      if (!staff || onlineClass.staffId.toString() !== staff._id.toString()) {
         return res.status(403).json({ success: false, message: 'Not authorized to delete this online class' });
      }
    }

    await onlineClass.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
