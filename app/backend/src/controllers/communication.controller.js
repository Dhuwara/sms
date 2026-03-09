import Announcement from '../models/Announcement.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';

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

// ── Class Contacts (for messaging parents) ───────────────────────────────────

export const getClassContacts = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const students = await Student.find({ classId, status: 'active' })
      .populate({ path: 'userId', select: 'name email phone' })
      .populate({ path: 'classId', select: 'name' })
      .populate({ path: 'parentId', populate: { path: 'userId', select: 'name email phone' } });

    const contacts = students.map(s => ({
      studentId: s._id,
      studentName: s.userId?.name || 'Unknown',
      studentEmail: s.userId?.email || '',
      rollNumber: s.rollNumber || '',
      className: s.classId?.name || '',
      gender: s.gender || '',
      parentName: s.parentId?.userId?.name || '',
      parentEmail: s.parentId?.userId?.email || '',
      parentPhone: s.parentId?.userId?.phone || s.parentContact || '',
      parentUserId: s.parentId?.userId?._id || null,
    }));

    res.json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
};

// ── Email / SMS / Circular (mocked — wire real provider when ready) ────────────

export const sendEmail = async (req, res, next) => {
  try {
    const { recipient_email, recipients, subject, message } = req.body;
    const emails = recipients || (recipient_email ? [recipient_email] : []);
    if (emails.length === 0 || !subject || !message) {
      return res.status(400).json({ success: false, message: 'recipients, subject and message are required' });
    }
    // TODO: integrate email provider (e.g. Resend, Nodemailer)
    emails.forEach(email => console.log(`[EMAIL] To: ${email} | Subject: ${subject}`));
    res.json({ success: true, message: `Email sent to ${emails.length} recipient(s)`, data: { sent: emails.length } });
  } catch (err) {
    next(err);
  }
};

export const sendSms = async (req, res, next) => {
  try {
    const { recipient, recipients, message } = req.body;
    const phones = recipients || (recipient ? [recipient] : []);
    if (phones.length === 0 || !message) return res.status(400).json({ success: false, message: 'recipients and message are required' });
    // TODO: integrate SMS provider (e.g. Twilio)
    phones.forEach(phone => console.log(`[SMS] To: ${phone} | Message: ${message}`));
    res.json({ success: true, message: `SMS sent to ${phones.length} recipient(s)`, data: { sent: phones.length } });
  } catch (err) {
    next(err);
  }
};

export const sendWhatsApp = async (req, res, next) => {
  try {
    const { recipient, recipients, message } = req.body;
    const phones = recipients || (recipient ? [recipient] : []);
    if (phones.length === 0 || !message) return res.status(400).json({ success: false, message: 'recipients and message are required' });
    // TODO: integrate WhatsApp Business API (e.g. Twilio WhatsApp, Meta Cloud API)
    phones.forEach(phone => console.log(`[WHATSAPP] To: ${phone} | Message: ${message}`));
    res.json({ success: true, message: `WhatsApp sent to ${phones.length} recipient(s)`, data: { sent: phones.length } });
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
