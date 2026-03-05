import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getBooks, createBook, updateBook, deleteBook,
  getIssues, issueBook, returnBook,
} from '../controllers/library.controller.js';

const router = Router();
router.use(protect);

router.get('/books', authorize('admin', 'staff', 'student'), getBooks);
router.post('/books', authorize('admin'), createBook);
router.put('/books/:id', authorize('admin'), updateBook);
router.delete('/books/:id', authorize('admin'), deleteBook);

router.get('/issues', authorize('admin', 'staff'), getIssues);
router.post('/issues', authorize('admin', 'staff'), issueBook);
router.put('/issues/:id/return', authorize('admin', 'staff'), returnBook);

export default router;
