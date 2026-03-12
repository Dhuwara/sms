import express from 'express';
import { 
  applyLeave, 
  getMyStudentLeaves, 
  getParentPendingLeaves, 
  parentAction, 
  getStaffPendingLeaves, 
  staffAction 
} from '../controllers/studentLeave.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.post('/apply', protect, authorize('student'), applyLeave);
router.get('/my-leaves', protect, authorize('student'), getMyStudentLeaves);

// Parent routes
router.get('/parent/pending', protect, authorize('parent'), getParentPendingLeaves);
router.put('/parent/action/:id', protect, authorize('parent'), parentAction);

// Staff routes
router.get('/staff/pending', protect, authorize('staff'), getStaffPendingLeaves);
router.put('/staff/action/:id', protect, authorize('staff'), staffAction);

export default router;
