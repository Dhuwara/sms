import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPayrolls, createPayroll, updatePayroll, deletePayroll,
  getMySalary, getMyPayrollHistory,
  submitReimbursement, getReimbursements, updateReimbursement,
} from '../controllers/payroll.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'staff'));

// Staff self-service routes (before generic routes)
router.get('/my-salary', getMySalary);
router.get('/my-history', getMyPayrollHistory);

// Reimbursement routes
router.get('/reimbursements', getReimbursements);
router.post('/reimbursements', submitReimbursement);
router.put('/reimbursements/:id', authorize('admin'), updateReimbursement);

// Admin payroll CRUD
router.get('/', getPayrolls);
router.post('/', authorize('admin'), createPayroll);
router.put('/:id', authorize('admin'), updatePayroll);
router.delete('/:id', authorize('admin'), deletePayroll);

export default router;
