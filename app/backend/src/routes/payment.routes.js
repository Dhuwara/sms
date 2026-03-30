import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
// import { paymentLimiter } from '../middleware/rateLimiter.js'; // Uncomment when Razorpay is re-enabled
import {
  /* createOrder, verifyPayment, */ getPaymentHistory, getStudentFeeDetails,
} from '../controllers/payment.controller.js';

const router = Router();
router.use(protect, authorize('parent'));

// ── Razorpay payment routes (commented out for future use) ───────────────────
// router.post('/create-order', paymentLimiter, createOrder);
// router.post('/verify', paymentLimiter, verifyPayment);
// ─────────────────────────────────────────────────────────────────────────────

router.get('/history/:studentId', getPaymentHistory);
router.get('/fee-details/:studentId', getStudentFeeDetails);

export default router;
