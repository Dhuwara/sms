import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAllFeeStructures, upsertFeeStructure, updateFeeStructure,
  deleteFeeStructure, getFeeStructureForClass,
} from '../controllers/feeStructure.controller.js';

const router = Router();
router.use(protect);

// Specific routes before dynamic :id
router.get('/class/:classId', authorize('admin', 'parent', 'student'), getFeeStructureForClass);
router.get('/',       authorize('admin'), getAllFeeStructures);
router.put('/',       authorize('admin'), upsertFeeStructure);
router.put('/:id',    authorize('admin'), updateFeeStructure);
router.delete('/:id', authorize('admin'), deleteFeeStructure);

export default router;
