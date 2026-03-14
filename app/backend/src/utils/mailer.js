import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,           // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email.
 * @param {object} opts
 * @param {string}   opts.fromEmail  - Sender's email address
 * @param {string}   opts.fromName   - Sender's display name
 * @param {string[]} opts.to         - Array of recipient email addresses
 * @param {string}   opts.subject
 * @param {string}   opts.text       - Plain-text body
 */
export const sendMail = async ({ fromEmail, fromName, to, subject, text }) => {
  console.log(fromEmail, fromName, to, subject, text,"emaill");
  const from = `"${fromName}" <${fromEmail}>`;
  await transporter.sendMail({ from, to, subject, text });
};
