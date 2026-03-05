import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getFeeTypes, createFeeType, updateFeeType, deleteFeeType,
  getFeeRecords, createFeeRecord, updateFeeRecord, deleteFeeRecord,
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

export default router;
