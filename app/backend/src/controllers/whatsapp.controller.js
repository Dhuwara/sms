import { sendWhatsAppText, sendWhatsAppBulk, getStaffPhones } from '../utils/whatsapp.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Staff from '../models/Staff.js';
import Class from '../models/Class.js';
import ClassMapping from '../models/ClassMapping.js';
import School from '../models/School.js';

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
 * Send a WhatsApp message to a target group.
 * Body: { message, recipientType, classId?, standard?, staffIds[]?, parentIds[]? }
 *
 * recipientType:
 *   'all-parents'          – all active parents
 *   'class-parents'        – parents of a specific class (classId required)
 *   'standard-parents'     – parents of a standard/grade (standard required)
 *   'all-staff'            – all active staff members
 *   'specific-staff'       – staffIds[] required
 *   'specific-parents'     – parentIds[] required
 */
export const sendBroadcast = async (req, res, next) => {
  try {
    const { message, recipientType = 'all-parents', classId, standard, staffIds, parentIds } = req.body;
    const schoolId = req.schoolId;

    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }
    if (!recipientType) {
      return res.status(400).json({ success: false, message: 'recipientType is required' });
    }

    const school = await School.findById(schoolId).select('whatsappPhoneNumberId');
    const schoolPhoneNumberId = school?.whatsappPhoneNumberId || undefined;

    let recipients = [];

    if (recipientType === 'all-staff') {
      const phones = await getStaffPhones(Staff, { schoolId });
      recipients = phones.map((s) => ({
        phone: s.phone,
        message: `Dear ${s.name},\n\n${message}\n\n- School Management`,
      }));

    } else if (recipientType === 'specific-staff') {
      if (!staffIds || staffIds.length === 0) {
        return res.status(400).json({ success: false, message: 'staffIds are required for specific-staff' });
      }
      const phones = await getStaffPhones(Staff, { _id: { $in: staffIds }, schoolId });
      recipients = phones.map((s) => ({
        phone: s.phone,
        message: `Dear ${s.name},\n\n${message}\n\n- School Management`,
      }));

    } else if (recipientType === 'specific-parents') {
      if (!parentIds || parentIds.length === 0) {
        return res.status(400).json({ success: false, message: 'parentIds are required for specific-parents' });
      }
      const parents = await Parent.find({ _id: { $in: parentIds } }).populate('userId', 'name phone');
      recipients = parents
        .filter((p) => p.userId?.phone)
        .map((p) => ({
          phone: p.userId.phone,
          message: `Dear ${p.userId.name || 'Parent'},\n\n${message}\n\n- School Management`,
        }));

    } else {
      // Parent-targeting variants
      let studentFilter = { status: 'active' };

      if (recipientType === 'class-parents') {
        if (!classId) {
          return res.status(400).json({ success: false, message: 'classId is required for class-parents' });
        }
        const mapping = await ClassMapping.findOne({ classId }).select('students');
        if (mapping?.students?.length > 0) {
          studentFilter._id = { $in: mapping.students };
        }
      } else if (recipientType === 'standard-parents') {
        if (!standard) {
          return res.status(400).json({ success: false, message: 'standard is required for standard-parents' });
        }
        // Find classes matching this standard then get students from mappings
        const matchingClasses = await Class.find({ name: standard, schoolId }).select('_id');
        const classIds = matchingClasses.map((c) => c._id);
        const mappings = await ClassMapping.find({ classId: { $in: classIds } }).select('students');
        const studentIds = mappings.flatMap((m) => m.students);
        if (studentIds.length > 0) {
          studentFilter._id = { $in: studentIds };
        }
      }
      // else: all-parents — no extra filter

      const students = await Student.find(studentFilter).select('parentId');
      const uniqueParentIds = [...new Set(students.map((s) => s.parentId).filter(Boolean).map(String))];

      if (uniqueParentIds.length === 0) {
        return res.json({ success: true, message: 'No parents found to notify', sent: 0 });
      }

      const parents = await Parent.find({ _id: { $in: uniqueParentIds } }).populate('userId', 'name phone');
      recipients = parents
        .filter((p) => p.userId?.phone)
        .map((p) => ({
          phone: p.userId.phone,
          message: `Dear ${p.userId.name || 'Parent'},\n\n${message}\n\n- School Management`,
        }));
    }

    if (recipients.length === 0) {
      return res.json({ success: true, message: 'No recipients with phone numbers found', sent: 0 });
    }

    // Fire-and-forget bulk send
    sendWhatsAppBulk(recipients, schoolPhoneNumberId).catch((err) =>
      console.error('Broadcast WhatsApp failed:', err.message)
    );

    res.json({
      success: true,
      message: `Sending to ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`,
      sent: recipients.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/whatsapp/recipients?type=staff|parents
 * Returns a list of recipients for the frontend picker UI.
 */
export const getRecipients = async (req, res, next) => {
  try {
    const { type = 'staff' } = req.query;
    const schoolId = req.schoolId;

    if (type === 'staff') {
      const staffList = await Staff.find({ status: 'active', schoolId })
        .populate('userId', 'name phone')
        .select('employeeId userId');

      const data = staffList
        .filter((s) => s.userId)
        .map((s) => ({
          _id: s._id,
          name: s.userId.name,
          phone: s.userId.phone || '',
          employeeId: s.employeeId || '',
        }));

      return res.json({ success: true, data });
    }

    if (type === 'parents') {
      const parents = await Parent.find({ schoolId })
        .populate('userId', 'name phone')
        .select('userId');

      const data = parents
        .filter((p) => p.userId)
        .map((p) => ({
          _id: p._id,
          name: p.userId.name,
          phone: p.userId.phone || '',
        }));

      return res.json({ success: true, data });
    }

    res.status(400).json({ success: false, message: 'type must be staff or parents' });
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
