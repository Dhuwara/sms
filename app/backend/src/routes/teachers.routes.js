import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../controllers/teachers.controller.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/', getTeachers);
router.post('/', createTeacher);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

export default router;
