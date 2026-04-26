import { sendMail } from '../utils/mailer.js';

const ADMIN_EMAIL = 'ajminstitution@gmail.com';
const SCHOOL_NAME = 'AJM International Institution';

/**
 * POST /api/enquiry
 * Public endpoint — no auth required.
 * Sends the contact form submission to the admin email.
 * Body: { name, email, message }
 */
export const submitEnquiry = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'name, email, and message are required' });
    }

    // Email to admin
    await sendMail({
      fromEmail: process.env.SMTP_USER,
      fromName: SCHOOL_NAME,
      to: [ADMIN_EMAIL],
      subject: `New Demo Request from ${name}`,
      text: `You have a new enquiry from the website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nReply directly to ${email} to respond.`,
    });

    // Confirmation email to the person
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
