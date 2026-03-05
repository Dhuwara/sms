import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getExams, createExam, updateExam, deleteExam,
  getExamResults, addExamResult, bulkAddResults, getStudentResults,
} from '../controllers/exam.controller.js';

const router = Router();
router.use(protect);

router.get('/', authorize('admin', 'staff', 'student', 'parent'), getExams);
router.post('/', authorize('admin', 'staff'), createExam);
router.put('/:id', authorize('admin', 'staff'), updateExam);
router.delete('/:id', authorize('admin'), deleteExam);

router.get('/my-results', authorize('student'), getStudentResults);
router.get('/:id/results', authorize('admin', 'staff'), getExamResults);
router.post('/:id/results', authorize('admin', 'staff'), addExamResult);
router.post('/:id/results/bulk', authorize('admin', 'staff'), bulkAddResults);

export default router;
