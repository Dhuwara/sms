import { sendMail } from '../utils/mailer.js';
import Enquiry from '../models/Enquiry.js';

const ADMIN_EMAIL = 'ajminstitution@gmail.com';
const SCHOOL_NAME = 'AJM International Institution';

// POST /api/enquiry — public
export const submitEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone = '', message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'name, email, and message are required' });
    }

    await Enquiry.create({ name, email, phone, message });

    await sendMail({
      fromEmail: process.env.SMTP_USER,
      fromName: SCHOOL_NAME,
      to: [ADMIN_EMAIL],
      subject: `New Demo Request from ${name}`,
      text: `You have a new enquiry from the website.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}\n\n---\nReply directly to ${email} to respond.`,
    });

    await sendMail({
      fromEmail: process.env.SMTP_USER,
      fromName: SCHOOL_NAME,
      to: [email],
      subject: `We received your message — ${SCHOOL_NAME}`,
      text: `Hi ${name},\n\nThank you for reaching out to ${SCHOOL_NAME}!\n\nWe have received your message and our team will get back to you within 24 hours.\n\nYour message:\n"${message}"\n\nBest regards,\n${SCHOOL_NAME}\nPhone: +91 9884620202\nEmail: ${ADMIN_EMAIL}`,
    });

    res.json({ success: true, message: 'Your message has been sent! We will contact you within 24 hours.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/enquiry — admin only
export const getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/enquiry/:id/contacted — admin only
export const markContacted = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    enquiry.contacted = !enquiry.contacted;
    await enquiry.save();
    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};
