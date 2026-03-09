import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getMyNotifications, markAsRead, markAllRead,
  createNotification, broadcastNotification, deleteNotification,
} from '../controllers/notification.controller.js';

const router = Router();
router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

router.post('/', authorize('admin'), createNotification);
router.post('/broadcast', authorize('admin'), broadcastNotification);

export default router;
