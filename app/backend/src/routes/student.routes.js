import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getMyGrades, getMyAttendance, getMySchedule, getMyFees } from '../controllers/student.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'staff', 'student'));

router.get('/me/grades', getMyGrades);
router.get('/me/attendance', getMyAttendance);
router.get('/me/schedule', getMySchedule);
router.get('/me/fees', getMyFees);

export default router;
