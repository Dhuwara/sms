import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getMyClasses, getStudentsByClass,
  getAttendance, markAttendance, updateAttendance,
  getGrades, createGrade, updateGrade,
  getSubjects,
} from '../controllers/staff.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'staff'));

router.get('/classes', getMyClasses);
router.get('/classes/:classId/students', getStudentsByClass);
router.get('/subjects', getSubjects);

router.get('/attendance', getAttendance);
router.post('/attendance', markAttendance);
router.put('/attendance/:id', updateAttendance);

router.get('/grades', getGrades);
router.post('/grades', createGrade);
router.put('/grades/:id', updateGrade);

export default router;
