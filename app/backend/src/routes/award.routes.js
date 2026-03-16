import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAwards, getMyAwards, getChildAwards,
  createAward, updateAward, deleteAward,
} from '../controllers/award.controller.js';

const router = Router();
router.use(protect);

router.get('/my', authorize('student'), getMyAwards);
router.get('/child/:studentId', authorize('parent'), getChildAwards);
router.get('/', authorize('admin', 'staff'), getAwards);
router.post('/', authorize('admin'), createAward);
router.put('/:id', authorize('admin'), updateAward);
router.delete('/:id', authorize('admin'), deleteAward);

export default router;
