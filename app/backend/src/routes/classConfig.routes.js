import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getClassConfig, upsertClassConfig } from '../controllers/classConfig.controller.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/', getClassConfig);
router.post('/upsert', upsertClassConfig);

export default router;
