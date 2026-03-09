import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getMyClasses, getStudentsByClass,
  getAttendance, markAttendance, updateAttendance,
  getGrades, createGrade, updateGrade,
  getSubjects, getAllStaff, getStaffProfileByUserId, getApprovers,
  changePassword, updateProfile,
  staffCheckIn, staffCheckOut, getStaffAttendanceToday, getStaffAttendanceHistory,
  applyLeave, getMyLeaves, getLeaveBalance,
  getPendingApprovals, approveRejectLeave,
  getStaffTimetable, getStaffSubstitutions, getStaffExamDuties,
  getTimetableAssignments,
} from '../controllers/staff.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'staff'));

// Specific routes before generic :id routes
router.get('/profile/:userId', getStaffProfileByUserId);
router.put('/change-password', changePassword);
router.put('/update-profile', updateProfile);

// Generic routes
router.get('/', getAllStaff);
router.get('/approvers', getApprovers);
router.get('/classes', getMyClasses);
router.get('/classes/:classId/students', getStudentsByClass);
router.get('/subjects', getSubjects);

router.get('/attendance', getAttendance);
router.post('/attendance', markAttendance);
router.put('/attendance/:id', updateAttendance);

router.get('/grades', getGrades);
router.post('/grades', createGrade);
router.put('/grades/:id', updateGrade);

// Staff Attendance routes
router.get('/my-attendance/today', getStaffAttendanceToday);
router.get('/my-attendance/history', getStaffAttendanceHistory);
router.post('/my-attendance/checkin', staffCheckIn);
router.post('/my-attendance/checkout', staffCheckOut);

// Staff Leave routes
router.get('/my-leaves', getMyLeaves);
router.get('/my-leaves/balance', getLeaveBalance);
router.post('/my-leaves/apply', applyLeave);

// Leave Approval routes
router.get('/leave-approvals', getPendingApprovals);
router.put('/leaves/:leaveId/action', approveRejectLeave);

// Staff Timetable routes
router.get('/timetable-assignments', getTimetableAssignments);
router.get('/my-timetable', getStaffTimetable);
router.get('/my-substitutions', getStaffSubstitutions);
router.get('/my-exam-duties', getStaffExamDuties);

export default router;
