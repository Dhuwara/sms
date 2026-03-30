import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getGradeConfig, saveGradeConfig } from '../controllers/gradeConfig.controller.js';

const router = Router();
router.use(protect);

router.get('/', getGradeConfig);
router.post('/', authorize('admin'), saveGradeConfig);

export default router;
