import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../controllers/students.controller.js';

const router = Router();
router.use(protect);

router.get('/', authorize('admin', 'staff'), getStudents);
router.post('/', authorize('admin'), createStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

export default router;
