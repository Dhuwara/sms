import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getBooks, createBook, updateBook, deleteBook,
  getIssues, issueBook, returnBook, markFinePaid, getLibraryReport, getMyIssues,
} from '../controllers/library.controller.js';

const router = Router();
router.use(protect);

router.get('/books', authorize('admin', 'staff', 'student'), getBooks);
router.post('/books', authorize('admin'), createBook);
router.put('/books/:id', authorize('admin'), updateBook);
router.delete('/books/:id', authorize('admin'), deleteBook);

router.get('/my-issues', authorize('student', 'staff'), getMyIssues);
router.get('/report', authorize('admin', 'staff'), getLibraryReport);
router.get('/issues', authorize('admin', 'staff'), getIssues);
router.post('/issues', authorize('admin', 'staff'), issueBook);
router.put('/issues/:id/return', authorize('admin', 'staff'), returnBook);
router.put('/issues/:id/fine-paid', authorize('admin', 'staff'), markFinePaid);

export default router;
