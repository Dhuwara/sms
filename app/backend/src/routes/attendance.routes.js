import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAttendance,
  markAttendance,
  updateAttendance,
  getClassStudents,
  getAttendanceReport,
} from '../controllers/attendance.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'staff'));

// Specific routes before generic :id routes
router.get('/class/:classId', getClassStudents);
router.get('/report', getAttendanceReport);

// Generic routes
router.get('/', getAttendance);
router.post('/', markAttendance);
router.put('/:id', updateAttendance);

export default router;
