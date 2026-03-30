import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { sendTestMessage, sendBroadcast, getStatus } from '../controllers/whatsapp.controller.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/status', getStatus);
router.post('/test', sendTestMessage);
router.post('/broadcast', sendBroadcast);

export default router;
