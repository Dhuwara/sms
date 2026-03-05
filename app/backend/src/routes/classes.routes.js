import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getClasses, createClass, updateClass, deleteClass } from '../controllers/classes.controller.js';

const router = Router();
router.use(protect);

router.get('/', authorize('admin', 'staff', 'student', 'parent'), getClasses);
router.post('/', authorize('admin'), createClass);
router.put('/:id', authorize('admin'), updateClass);
router.delete('/:id', authorize('admin'), deleteClass);

export default router;
