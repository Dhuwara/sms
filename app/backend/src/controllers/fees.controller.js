import FeeType from '../models/FeeType.js';
import FeeRecord from '../models/FeeRecord.js';
import Student from '../models/Student.js';
import FeeStructure from '../models/FeeStructure.js';
import StudentFeePayment from '../models/StudentFeePayment.js';
import Class from '../models/Class.js';

// ── Fee Types ─────────────────────────────────────────────────────────────────

export const getFeeTypes = async (req, res, next) => {
  try {
    const types = await FeeType.find().sort({ createdAt: -1 });
    res.json({ success: true, data: types });
  } catch (err) {
    next(err);
  }
};

export const createFeeType = async (req, res, next) => {
  try {
    const { name, amount, due_date, description, category, frequency } = req.body;
    if (!name || !amount) return res.status(400).json({ success: false, message: 'Name and amount are required' });
    const type = await FeeType.create({ name, amount, dueDate: due_date, description, category, frequency });
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    next(err);
  }
};

export const updateFeeType = async (req, res, next) => {
  try {
    const type = await FeeType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!type) return res.status(404).json({ success: false, message: 'Fee type not found' });
    res.json({ success: true, data: type });
  } catch (err) {
    next(err);
  }
};

export const deleteFeeType = async (req, res, next) => {
  try {
    const type = await FeeType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Fee type not found' });
    res.json({ success: true, message: 'Fee type deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Fee Records ───────────────────────────────────────────────────────────────

export const getFeeRecords = async (req, res, next) => {
  try {
    const { studentId, status, classId } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    if (classId) {
      const students = await Student.find({ classId }).select('_id');
      filter.studentId = { $in: students.map(s => s._id) };
    }

    const records = await FeeRecord.find(filter)
      .populate({
        path: 'studentId',
        populate: [{ path: 'userId', select: 'name' }, { path: 'classId', select: 'name section' }],
      })
      .sort({ dueDate: -1 });

    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

export const createFeeRecord = async (req, res, next) => {
  try {
    const record = await FeeRecord.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const updateFeeRecord = async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.status === 'paid' && !update.paidAt) update.paidAt = new Date();
    const record = await FeeRecord.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const deleteFeeRecord = async (req, res, next) => {
  try {
    const record = await FeeRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.json({ success: true, message: 'Fee record deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Student Fee Payments (per-component tracking) ────────────────────────────

// Roman numeral → Arabic for grades 1–12
const ROMAN = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 };
const parseGradePart = (part) => {
  const up = part.toUpperCase();
  if (ROMAN[up] !== undefined) return String(ROMAN[up]);
  if (/^\d+$/.test(part)) return part;
  return part;
};
const normalizeStandard = (className) => {
  const parts = className.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0].toLowerCase() === 'grade') return parseGradePart(parts[1]);
  return parts[0];
};

// GET /api/fees/student-fees?classId=xxx&feeStructureId=yyy
// Returns all students of a class with their fee payment status per component
export const getStudentFees = async (req, res, next) => {
  try {
    const { classId, feeStructureId } = req.query;
    if (!classId || !feeStructureId) {
      return res.status(400).json({ success: false, message: 'classId and feeStructureId are required' });
    }

    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) return res.status(404).json({ success: false, message: 'Fee structure not found' });

    const students = await Student.find({ classId, status: 'active' })
      .populate('userId', 'name')
      .sort({ rollNumber: 1 });

    const studentIds = students.map(s => s._id);
    const payments = await StudentFeePayment.find({
      studentId: { $in: studentIds },
      feeStructureId,
    });

    // Build a map: studentId -> { componentName -> payment }
    const paymentMap = {};
    for (const p of payments) {
      const sid = p.studentId.toString();
      if (!paymentMap[sid]) paymentMap[sid] = {};
      paymentMap[sid][p.componentName] = { status: p.status, paidAt: p.paidAt, _id: p._id };
    }

    const totalComponentAmount = feeStructure.components.reduce((sum, c) => sum + c.amount, 0);

    const result = students.map(s => {
      const sid = s._id.toString();
      const studentPayments = paymentMap[sid] || {};
      let totalPaid = 0;
      const components = feeStructure.components.map(c => {
        const payment = studentPayments[c.name];
        const isPaid = payment?.status === 'paid';
        if (isPaid) totalPaid += c.amount;
        return {
          name: c.name,
          amount: c.amount,
          dueDate: c.dueDate,
          status: isPaid ? 'paid' : 'pending',
          paidAt: payment?.paidAt || null,
        };
      });
      return {
        studentId: s._id,
        name: s.userId?.name || 'Unknown',
        rollNumber: s.rollNumber,
        components,
        totalFees: totalComponentAmount,
        totalPaid,
        totalPending: totalComponentAmount - totalPaid,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// PUT /api/fees/student-fees/toggle
// Toggle a student's fee component payment status
export const toggleStudentFeePayment = async (req, res, next) => {
  try {
    const { studentId, feeStructureId, componentName, status } = req.body;
    if (!studentId || !feeStructureId || !componentName || !status) {
      return res.status(400).json({ success: false, message: 'studentId, feeStructureId, componentName and status are required' });
    }

    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) return res.status(404).json({ success: false, message: 'Fee structure not found' });

    const component = feeStructure.components.find(c => c.name === componentName);
    if (!component) return res.status(404).json({ success: false, message: 'Component not found in fee structure' });

    const update = {
      amount: component.amount,
      status,
      paidAt: status === 'paid' ? new Date() : null,
    };

    const payment = await StudentFeePayment.findOneAndUpdate(
      { studentId, feeStructureId, componentName },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// GET /api/fees/fee-structures-by-class/:classId
// Get fee structures applicable to a class (resolves standard from class)
export const getFeeStructuresByClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

    const standard = normalizeStandard(cls.name);

    // Find class-specific and standard-wide structures
    const structures = await FeeStructure.find({
      standard,
      $or: [{ classId: req.params.classId }, { classId: null }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: structures });
  } catch (err) {
    next(err);
  }
};
