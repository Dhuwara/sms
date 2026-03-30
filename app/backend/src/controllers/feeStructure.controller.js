import FeeStructure from '../models/FeeStructure.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Notification from '../models/Notification.js';
import { sendMail } from '../utils/mailer.js';
import { sendWhatsAppBulk } from '../utils/whatsapp.js';

// Roman numeral → Arabic for grades 1–12
const ROMAN = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 };

const parseGradePart = (part) => {
  const up = part.toUpperCase();
  if (ROMAN[up] !== undefined) return String(ROMAN[up]);
  if (/^\d+$/.test(part)) return part;
  return part;
};

// Normalize Class.name → standard key stored in FeeStructure
// handles "Grade 12", "Grade XII", "LKG", "UKG", etc.
const normalizeStandard = (className) => {
  const parts = className.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0].toLowerCase() === 'grade') {
    return parseGradePart(parts[1]);
  }
  return parts[0];
};

/**
 * Notify all parents of students in classes matching a standard.
 * Sends in-app notification + email with fee breakdown.
 */
const notifyParentsOfFeeStructure = async (feeStructure) => {
  try {
    const { standard, academicYear, totalFees, components, classId } = feeStructure;

    // Find all classes that match this standard
    const allClasses = await Class.find();
    const matchingClassIds = allClasses
      .filter(c => normalizeStandard(c.name) === standard)
      .filter(c => !classId || String(c._id) === String(classId))
      .map(c => c._id);

    if (matchingClassIds.length === 0) return;

    const students = await Student.find({ classId: { $in: matchingClassIds }, status: 'active' })
      .select('parentId');
    const parentIds = [...new Set(students.map(s => s.parentId).filter(Boolean).map(String))];
    if (parentIds.length === 0) return;

    // Get parent user IDs and emails
    const parents = await Parent.find({ _id: { $in: parentIds } })
      .populate('userId', 'name email');

    const userIds = parents.map(p => p.userId?._id).filter(Boolean);
    const emails = parents.map(p => p.userId?.email).filter(Boolean);

    // Build component breakdown text
    const componentLines = components.map(c => {
      const due = c.dueDate ? ` (Due: ${new Date(c.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})` : '';
      return `  - ${c.name}: Rs.${c.amount.toLocaleString()}${due}`;
    }).join('\n');

    const title = `Fee Structure Published — ${standard} (${academicYear})`;
    const message = `The fee structure for Standard ${standard}, Academic Year ${academicYear} has been published.\n\nTotal Fees: Rs.${totalFees.toLocaleString()}\n\nBreakdown:\n${componentLines}\n\nPlease pay the first due term through the Fees section in your dashboard.`;

    // In-app notifications
    if (userIds.length > 0) {
      const docs = userIds.map(uid => ({
        userId: uid,
        title,
        message,
        type: 'info',
        link: '/fees',
      }));
      await Notification.insertMany(docs);
    }

    // Email notifications (fire-and-forget)
    if (emails.length > 0) {
      sendMail({
        fromEmail: process.env.SMTP_USER,
        fromName: process.env.SMTP_FROM_NAME || 'School Management System',
        to: emails,
        subject: title,
        text: message,
      }).catch(err => console.error('Fee structure email failed:', err.message));
    }

    // WhatsApp notifications (fire-and-forget)
    const waRecipients = parents
      .filter(p => p.userId?.phone)
      .map(p => ({
        phone: p.userId.phone,
        message: `Dear ${p.userId.name || 'Parent'},\n\n${title}\n\nTotal Fees: Rs.${totalFees.toLocaleString()}\n\n${componentLines}\n\nPlease pay through the Fees section in your dashboard.\n\n- School Management`,
      }));
    if (waRecipients.length > 0) {
      sendWhatsAppBulk(waRecipients).catch(err => console.error('Fee structure WhatsApp failed:', err.message));
    }
  } catch (err) {
    console.error('Failed to notify parents of fee structure:', err.message);
  }
};

// GET /api/fee-structure?year=2025-26  (admin)
export const getAllFeeStructures = async (req, res, next) => {
  try {
    const filter = { schoolId: req.user.schoolId };
    if (req.query.year) filter.academicYear = req.query.year;
    const structures = await FeeStructure.find(filter)
      .populate('classId', 'name section')
      .sort({ standard: 1 });
    res.json({ success: true, data: structures });
  } catch (err) {
    next(err);
  }
};

// PUT /api/fee-structure  (admin — create/upsert new)
export const upsertFeeStructure = async (req, res, next) => {
  try {
    const { standard, classId, academicYear, totalFees, components } = req.body;
    if (!standard || !academicYear || totalFees == null) {
      return res.status(400).json({ success: false, message: 'standard, academicYear and totalFees are required' });
    }
    if (components && !Array.isArray(components)) {
      return res.status(400).json({ success: false, message: 'components must be an array' });
    }

    const query = { standard, academicYear, classId: classId || null, schoolId: req.user.schoolId };
    const update = { $set: { standard, academicYear, classId: classId || null, totalFees, components: components || [], schoolId: req.user.schoolId } };
    const doc = await FeeStructure.findOneAndUpdate(query, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });

    // Notification is now triggered separately via POST /api/fee-structure/:id/notify
    // so admin can confirm before sending

    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// PUT /api/fee-structure/:id  (admin — update existing by _id)
export const updateFeeStructure = async (req, res, next) => {
  try {
    const { totalFees, components } = req.body;
    if (totalFees == null) {
      return res.status(400).json({ success: false, message: 'totalFees is required' });
    }
    const doc = await FeeStructure.findByIdAndUpdate(
      req.params.id,
      { $set: { totalFees, components: components || [] } },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Fee structure not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/fee-structure/:id  (admin)
export const deleteFeeStructure = async (req, res, next) => {
  try {
    const doc = await FeeStructure.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Fee structure not found' });
    res.json({ success: true, message: 'Fee structure deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/fee-structure/class/:classId  (parent / student / admin)
export const getFeeStructureForClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

    const standard = normalizeStandard(cls.name);

    // For 11 & 12: try class-specific record first, then fall back to standard-wide
    let structure = await FeeStructure.findOne({ standard, classId: req.params.classId, schoolId: req.user.schoolId });
    if (!structure) {
      structure = await FeeStructure.findOne({ standard, classId: null, schoolId: req.user.schoolId });
    }
    if (!structure) {
      return res.status(404).json({ success: false, message: 'No fee structure configured for this class' });
    }
    res.json({ success: true, data: structure });
  } catch (err) {
    next(err);
  }
};

// POST /api/fee-structure/:id/notify  (admin — manually notify parents)
export const notifyParents = async (req, res, next) => {
  try {
    const doc = await FeeStructure.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Fee structure not found' });

    await notifyParentsOfFeeStructure(doc);
    res.json({ success: true, message: 'Notifications sent to parents' });
  } catch (err) {
    next(err);
  }
};
