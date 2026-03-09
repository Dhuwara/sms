import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getMapping, saveMapping, getAssignedStudents } from '../controllers/classMapping.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'staff'));

router.get('/assigned-students/:academicYear', getAssignedStudents);
router.get('/:classId/:academicYear', getMapping);
router.post('/save', saveMapping);

export default router;
