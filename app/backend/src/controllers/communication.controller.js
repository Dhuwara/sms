import Announcement from '../models/Announcement.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// ── Announcements ─────────────────────────────────────────────────────────────

export const getAnnouncements = async (req, res, next) => {
  try {
    const { audience } = req.query;
    const filter = {};
    if (audience) filter.$or = [{ targetAudience: audience }, { targetAudience: 'all' }];
    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, priority, targetAudience } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message are required' });
    const announcement = await Announcement.create({
      title, message, priority, targetAudience,
      createdBy: req.user.userId,
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const a = await Announcement.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Messages ──────────────────────────────────────────────────────────────────

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const messages = await Message.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    })
      .populate('fromUserId', 'name role')
      .populate('toUserId', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { toUserId, content } = req.body;
    if (!toUserId || !content) return res.status(400).json({ success: false, message: 'Recipient and content are required' });
    const to = await User.findById(toUserId);
    if (!to) return res.status(404).json({ success: false, message: 'Recipient not found' });
    const msg = await Message.create({ fromUserId: req.user.userId, toUserId, content });
    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

export const markMessageRead = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { readAt: new Date() }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

// ── Email / SMS / Circular (mocked — wire real provider when ready) ────────────

export const sendEmail = async (req, res, next) => {
  try {
    const { recipient_email, subject, message } = req.body;
    if (!recipient_email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'recipient_email, subject and message are required' });
    }
    // TODO: integrate email provider (e.g. Resend, Nodemailer)
    console.log(`[EMAIL] To: ${recipient_email} | Subject: ${subject}`);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    next(err);
  }
};

export const sendSms = async (req, res, next) => {
  try {
    const { recipient, message } = req.body;
    if (!recipient || !message) return res.status(400).json({ success: false, message: 'recipient and message are required' });
    // TODO: integrate SMS provider (e.g. Twilio)
    console.log(`[SMS] To: ${recipient} | Message: ${message}`);
    res.json({ success: true, message: 'SMS sent successfully' });
  } catch (err) {
    next(err);
  }
};

export const sendCircular = async (req, res, next) => {
  try {
    const { title, content, recipients } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required' });
    const announcement = await Announcement.create({
      title, message: content,
      targetAudience: recipients === 'all' ? 'all' : recipients,
      priority: 'normal',
      createdBy: req.user.userId,
    });
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
};
