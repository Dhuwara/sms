import Notification from '../models/Notification.js';

// GET /api/notifications — current user's notifications (latest 30)
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ userId: req.user.userId, read: false });
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/read-all
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications — admin creates a notification for a user
export const createNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type, link } = req.body;
    if (!userId || !title) {
      return res.status(400).json({ success: false, message: 'userId and title are required' });
    }
    const notif = await Notification.create({ userId, title, message, type: type || 'info', link });
    res.status(201).json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/broadcast — admin sends to all or by role
export const broadcastNotification = async (req, res, next) => {
  try {
    const { userIds, title, message, type, link } = req.body;
    if (!userIds?.length || !title) {
      return res.status(400).json({ success: false, message: 'userIds array and title are required' });
    }
    const docs = userIds.map(uid => ({ userId: uid, title, message, type: type || 'info', link }));
    await Notification.insertMany(docs);
    res.status(201).json({ success: true, message: `Sent to ${userIds.length} user(s)` });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};
