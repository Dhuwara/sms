import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getMapping, saveMapping } from '../controllers/classMapping.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'staff'));

router.get('/:classId/:academicYear', getMapping);
router.post('/save', saveMapping);

export default router;
