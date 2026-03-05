import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getChildren, getChildGrades, getChildAttendance, getChildFees } from '../controllers/parent.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'parent'));

router.get('/children', getChildren);
router.get('/children/:childId/grades', getChildGrades);
router.get('/children/:childId/attendance', getChildAttendance);
router.get('/children/:childId/fees', getChildFees);

export default router;
