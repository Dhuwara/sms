import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getScholarships, getMyScholarships,
  createScholarship, updateScholarship, deleteScholarship,
} from '../controllers/scholarship.controller.js';

const router = Router();
router.use(protect);

router.get('/my', authorize('student'), getMyScholarships);
router.get('/', authorize('admin', 'staff'), getScholarships);
router.post('/', authorize('admin'), createScholarship);
router.put('/:id', authorize('admin'), updateScholarship);
router.delete('/:id', authorize('admin'), deleteScholarship);

export default router;
