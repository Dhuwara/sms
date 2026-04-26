import OnlineClass from '../models/OnlineClass.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';
import ClassMapping from '../models/ClassMapping.js';
import Parent from '../models/Parent.js';
import User from '../models/User.js';
import { sendMail } from '../utils/mailer.js';

const getAcademicYear = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return m >= 6 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};

// @desc    Create an online class
// @route   POST /api/online-classes
// @access  Private (Staff/Admin)
export const createOnlineClass = async (req, res, next) => {
  try {
    let staffId = null;
    let teacherUser = null;

    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ userId: req.user.userId }).populate('userId', 'name email');
      if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });
      staffId = staff._id;
      teacherUser = staff.userId;
    } else {
      staffId = req.body.staffId;
      if (staffId) {
        const staff = await Staff.findById(staffId).populate('userId', 'name email');
        teacherUser = staff?.userId || null;
      }
    }

    const onlineClass = await OnlineClass.create({
      ...req.body,
      staffId,
      schoolId: req.user.schoolId,
    });

    res.status(201).json({ success: true, data: onlineClass });

    // Send email notifications (non-blocking — response already sent)
    if (teacherUser?.email && req.body.classId) {
      try {
        const academicYear = getAcademicYear();
        const mapping = await ClassMapping.findOne({ classId: req.body.classId, academicYear })
          .populate({ path: 'students', select: 'userId parentId' });

        const studentIds = (mapping?.students || []).map(s => s._id);
        const studentUserIds = (mapping?.students || []).map(s => s.userId).filter(Boolean);
        const parentDocs = await Parent.find({ children: { $in: studentIds } }).select('userId');
        const parentUserIds = parentDocs.map(p => p.userId).filter(Boolean);

        const allUserIds = [...new Set([...studentUserIds, ...parentUserIds].map(id => id.toString()))];
        const users = await User.find({ _id: { $in: allUserIds } }).select('email');
        const recipientEmails = users.map(u => u.email).filter(Boolean);

        const dateStr = new Date(onlineClass.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        const subject = `Online Class Scheduled: ${onlineClass.title}`;
        const text = [
          `Dear Student / Parent,`,
          ``,
          `An online class has been scheduled. Please find the details below:`,
          ``,
          `  Subject   : ${onlineClass.subject}`,
          `  Topic     : ${onlineClass.title}`,
          `  Date      : ${dateStr}`,
          `  Time      : ${onlineClass.time}`,
          `  Platform  : ${onlineClass.platform}`,
          `  Join Link : ${onlineClass.meetingLink}`,
          ``,
          `Please join on time.`,
          ``,
          `Regards,`,
          `${teacherUser.name}`,
        ].join('\n');

        // Email to students and parents
        if (recipientEmails.length > 0) {
          sendMail({
            fromEmail: teacherUser.email,
            fromName: teacherUser.name,
            replyTo: teacherUser.email,
            to: recipientEmails,
            subject,
            text,
          }).catch(() => {});
        }

        // Email to teacher themselves
        sendMail({
          fromEmail: teacherUser.email,
          fromName: teacherUser.name,
          to: [teacherUser.email],
          subject: `[Confirmation] ${subject}`,
          text: `This is a confirmation that you have scheduled the following online class:\n\n${text}`,
        }).catch(() => {});
      } catch { /* non-critical */ }
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all online classes for a specific class
// @route   GET /api/online-classes/class/:classId
// @access  Private (Staff/Admin)
export const getOnlineClasses = async (req, res, next) => {
  try {
    const onlineClasses = await OnlineClass.find({ classId: req.params.classId, schoolId: req.user.schoolId })
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
