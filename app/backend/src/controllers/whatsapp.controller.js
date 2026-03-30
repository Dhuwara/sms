import { sendWhatsAppText, sendWhatsAppBulk } from '../utils/whatsapp.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Class from '../models/Class.js';
import ClassMapping from '../models/ClassMapping.js';

/**
 * POST /api/whatsapp/test
 * Send a test message to verify WhatsApp configuration.
 * Body: { phone, message }
 */
export const sendTestMessage = async (req, res, next) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: 'phone and message are required' });
    }

    const result = await sendWhatsAppText(phone, message);
    if (!result) {
      return res.status(400).json({ success: false, message: 'WhatsApp is not enabled. Set WHATSAPP_ENABLED=true in .env' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/whatsapp/broadcast
 * Send a broadcast message to all parents or parents of a specific class.
 * Body: { message, classId? }
 */
export const sendBroadcast = async (req, res, next) => {
  try {
    const { message, classId } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    let studentFilter = { status: 'active' };
    if (classId) {
      const mapping = await ClassMapping.findOne({ classId }).select('students');
      if (mapping?.students?.length > 0) {
        studentFilter._id = { $in: mapping.students };
      }
    }

    const students = await Student.find(studentFilter).select('parentId');
    const parentIds = [...new Set(students.map((s) => s.parentId).filter(Boolean).map(String))];

    if (parentIds.length === 0) {
      return res.json({ success: true, message: 'No parents found to notify', sent: 0 });
    }

    const parents = await Parent.find({ _id: { $in: parentIds } }).populate('userId', 'name phone');

    const recipients = parents
      .filter((p) => p.userId?.phone)
      .map((p) => ({
        phone: p.userId.phone,
        message: `Dear ${p.userId.name || 'Parent'},\n\n${message}\n\n- School Management`,
      }));

    // Fire-and-forget
    sendWhatsAppBulk(recipients).catch((err) =>
      console.error('Broadcast WhatsApp failed:', err.message)
    );

    res.json({ success: true, message: `Sending to ${recipients.length} parents`, sent: recipients.length });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/whatsapp/status
 * Check WhatsApp integration status.
 */
export const getStatus = async (req, res, next) => {
  try {
    const enabled = process.env.WHATSAPP_ENABLED === 'true';
    const configured = !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);

    res.json({
      success: true,
      data: {
        enabled,
        configured,
        phoneNumberId: configured ? '****' + (process.env.WHATSAPP_PHONE_NUMBER_ID || '').slice(-4) : null,
      },
    });
  } catch (err) {
    next(err);
  }
};
