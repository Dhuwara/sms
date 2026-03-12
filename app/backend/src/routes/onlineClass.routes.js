import express from 'express';
import {
  createOnlineClass,
  getOnlineClasses,
  getMyOnlineClasses,
  deleteOnlineClass
} from '../controllers/onlineClass.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Staff and admin routes
router.post('/', authorize('staff', 'admin'), createOnlineClass);
router.get('/class/:classId', authorize('staff', 'admin'), getOnlineClasses);
router.delete('/:id', authorize('staff', 'admin'), deleteOnlineClass);

// Student route
router.get('/my-classes', authorize('student'), getMyOnlineClasses);

export default router;
