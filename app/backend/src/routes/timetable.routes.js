import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getPeriodConfig, savePeriodConfig, getTimetable, saveTimetable } from '../controllers/timetable.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'staff'));

// /periods must be declared before /:classId to avoid param conflict
router.get('/periods/:classId/:academicYear', getPeriodConfig);
router.post('/periods', savePeriodConfig);
router.get('/:classId/:academicYear', getTimetable);
router.post('/', saveTimetable);

export default router;
