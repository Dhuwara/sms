import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAnnouncements, createAnnouncement, deleteAnnouncement,
  getMessages, sendMessage, markMessageRead,
  sendEmail, sendSms, sendCircular,
} from '../controllers/communication.controller.js';

const router = Router();
router.use(protect);

router.get('/announcements', getAnnouncements);
router.post('/announcements', authorize('admin', 'staff'), createAnnouncement);
router.delete('/announcements/:id', authorize('admin'), deleteAnnouncement);

router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.put('/messages/:id/read', markMessageRead);

router.post('/send-email', authorize('admin', 'staff'), sendEmail);
router.post('/send-sms', authorize('admin', 'staff'), sendSms);
router.post('/circular', authorize('admin', 'staff'), sendCircular);

export default router;
