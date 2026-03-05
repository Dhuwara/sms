import FeeType from '../models/FeeType.js';
import FeeRecord from '../models/FeeRecord.js';
import Student from '../models/Student.js';

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
