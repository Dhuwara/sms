import { Router } from 'express';
import { submitEnquiry, getEnquiries, markContacted } from '../controllers/enquiry.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', submitEnquiry);
router.get('/', protect, getEnquiries);
router.patch('/:id/contacted', protect, markContacted);

export default router;
