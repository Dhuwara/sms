import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { sendTestMessage, sendBroadcast, getRecipients, getStatus } from '../controllers/whatsapp.controller.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/status', getStatus);
router.get('/recipients', getRecipients);
router.post('/test', sendTestMessage);
router.post('/broadcast', sendBroadcast);

export default router;
