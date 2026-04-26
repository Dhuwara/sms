import { Router } from 'express';
import { submitEnquiry } from '../controllers/enquiry.controller.js';

const router = Router();

// Public — no auth middleware
router.post('/', submitEnquiry);

export default router;
