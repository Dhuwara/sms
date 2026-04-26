import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getSubstitutions, getMySubstituteDuties,
  createSubstitution, updateSubstitution, deleteSubstitution,
  getPeriodsByClassAndDate, respondToSubstitution,
  getFreePeriodsByAbsentTeacher, getFreeTeachersForPeriod,
} from '../controllers/substitution.controller.js';

const router = Router();
router.use(protect);

// Staff: their own substitute duties (specific route before /:id)
router.get('/my-duties', authorize('staff', 'admin'), getMySubstituteDuties);

// Cascading data for admin form
router.get('/periods-by-class', authorize('admin'), getPeriodsByClassAndDate);
router.get('/free-periods', authorize('admin'), getFreePeriodsByAbsentTeacher);
router.get('/free-teachers', authorize('admin'), getFreeTeachersForPeriod);

// Admin CRUD
router.get('/', authorize('admin', 'staff'), getSubstitutions);
router.post('/', authorize('admin'), createSubstitution);
router.put('/:id', authorize('admin'), updateSubstitution);
router.delete('/:id', authorize('admin'), deleteSubstitution);

// Staff respond to substitution
router.put('/:id/respond', authorize('staff'), respondToSubstitution);

export default router;
