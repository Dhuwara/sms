import Payroll from '../models/Payroll.js';
import Reimbursement from '../models/Reimbursement.js';
import Staff from '../models/Staff.js';

// GET /api/payroll — admin: all payrolls, staff: own payrolls
export const getPayrolls = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ userId: req.user.userId });
      if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });
      filter.staffId = staff._id;
    }
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const payrolls = await Payroll.find(filter)
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name email' } })
      .sort({ year: -1, month: -1 });
    res.json({ success: true, data: payrolls });
  } catch (err) { next(err); }
};

// POST /api/payroll — admin only: create/generate payroll
export const createPayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.create(req.body);
    res.status(201).json({ success: true, data: payroll });
  } catch (err) { next(err); }
};

// PUT /api/payroll/:id — admin only: update payroll
export const updatePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });
    res.json({ success: true, data: payroll });
  } catch (err) { next(err); }
};

// GET /api/payroll/my-salary — staff: own latest payroll slip
export const getMySalary = async (req, res, next) => {
  try {
    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const latest = await Payroll.findOne({ staffId: staff._id })
      .sort({ year: -1, month: -1 });
    res.json({ success: true, data: latest });
  } catch (err) { next(err); }
};

// GET /api/payroll/my-history — staff: own payroll history
export const getMyPayrollHistory = async (req, res, next) => {
  try {
    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const payrolls = await Payroll.find({ staffId: staff._id })
      .sort({ year: -1, month: -1 })
      .limit(12);
    res.json({ success: true, data: payrolls });
  } catch (err) { next(err); }
};

// POST /api/payroll/reimbursements — staff: submit reimbursement
export const submitReimbursement = async (req, res, next) => {
  try {
    const staff = await Staff.findOne({ userId: req.user.userId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

    const reimbursement = await Reimbursement.create({ ...req.body, staffId: staff._id });
    res.status(201).json({ success: true, data: reimbursement });
  } catch (err) { next(err); }
};

// GET /api/payroll/reimbursements — staff: own claims, admin: all claims
export const getReimbursements = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ userId: req.user.userId });
      if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });
      filter.staffId = staff._id;
    }
    const reimbursements = await Reimbursement.find(filter)
      .populate({ path: 'staffId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reimbursements });
  } catch (err) { next(err); }
};

// DELETE /api/payroll/:id — admin only: delete payroll
export const deletePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });
    res.json({ success: true, message: 'Payroll deleted' });
  } catch (err) { next(err); }
};

// PUT /api/payroll/reimbursements/:id — admin: approve/reject
export const updateReimbursement = async (req, res, next) => {
  try {
    const reimbursement = await Reimbursement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reimbursement) return res.status(404).json({ success: false, message: 'Reimbursement not found' });
    res.json({ success: true, data: reimbursement });
  } catch (err) { next(err); }
};
