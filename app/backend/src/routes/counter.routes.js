import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { configureCounter, getCounter } from '../controllers/counter.controller.js';

const router = Router();
router.use(protect, authorize('admin'));

router.post('/configure', configureCounter);
router.get('/:name', getCounter);

export default router;
