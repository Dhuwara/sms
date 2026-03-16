import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getFeeTypes, createFeeType, updateFeeType, deleteFeeType,
  getFeeRecords, createFeeRecord, updateFeeRecord, deleteFeeRecord,
  getStudentFees, toggleStudentFeePayment, getFeeStructuresByClass,
} from '../controllers/fees.controller.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/types', getFeeTypes);
router.post('/types', createFeeType);
router.put('/types/:id', updateFeeType);
router.delete('/types/:id', deleteFeeType);

router.get('/records', getFeeRecords);
router.post('/records', createFeeRecord);
router.put('/records/:id', updateFeeRecord);
router.delete('/records/:id', deleteFeeRecord);

router.get('/student-fees', getStudentFees);
router.put('/student-fees/toggle', toggleStudentFeePayment);
router.get('/fee-structures-by-class/:classId', getFeeStructuresByClass);

export default router;
