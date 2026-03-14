import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createPTM, getPTMs, getPTMsForParent, deletePTM } from '../controllers/ptm.controller.js';

const router = Router();
router.use(protect);

router.get('/parent', authorize('admin', 'parent'), getPTMsForParent);
router.get('/',       authorize('admin', 'staff'),  getPTMs);
router.post('/',      authorize('admin', 'staff'),  createPTM);
router.delete('/:id', authorize('admin', 'staff'),  deletePTM);

export default router;
