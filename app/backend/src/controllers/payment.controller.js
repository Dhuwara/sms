import crypto from 'crypto';
import Razorpay from 'razorpay';
import Payment from '../models/Payment.js';
import FeeStructure from '../models/FeeStructure.js';
import StudentFeePayment from '../models/StudentFeePayment.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Class from '../models/Class.js';

let razorpay;
const getRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

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

/**
 * Validate parent owns the child and return { parent, student }
 */
const validateParentChild = async (userId, studentId) => {
  const parent = await Parent.findOne({ userId });
  if (!parent) throw Object.assign(new Error('Parent profile not found'), { status: 404 });

  if (!parent.children.map(String).includes(String(studentId))) {
    throw Object.assign(new Error('Access denied — not your child'), { status: 403 });
  }
  const student = await Student.findById(studentId).populate('classId', 'name section');
  if (!student) throw Object.assign(new Error('Student not found'), { status: 404 });

  return { parent, student };
};

/**
 * Get fee structure for a student's class, enforcing term order.
 * Returns the first unpaid component (by dueDate order in the structure).
 */
const getNextPayableComponent = async (studentId, feeStructureId) => {
  const feeStructure = await FeeStructure.findById(feeStructureId);
  if (!feeStructure) throw Object.assign(new Error('Fee structure not found'), { status: 404 });

  // Get existing payments for this student + structure
  const payments = await StudentFeePayment.find({ studentId, feeStructureId });
  const paidSet = new Set(payments.filter(p => p.status === 'paid').map(p => p.componentName));

  // Components are ordered by their position in the array (admin sets order via due dates)
  const unpaid = feeStructure.components.filter(c => !paidSet.has(c.name));
  return { feeStructure, unpaid };
};

// ── POST /api/payments/create-order ──────────────────────────────────────────
// Parent creates a Razorpay order for a specific fee component
export const createOrder = async (req, res, next) => {
  try {
    const { studentId, feeStructureId, componentName } = req.body;
    if (!studentId || !feeStructureId || !componentName) {
      return res.status(400).json({ success: false, message: 'studentId, feeStructureId and componentName are required' });
    }

    // 1. Verify parent-child relationship
    const { parent, student } = await validateParentChild(req.user.userId, studentId);

    // 2. Verify fee structure belongs to this student's class
    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) return res.status(404).json({ success: false, message: 'Fee structure not found' });

    const classId = student.classId?._id || student.classId;
    const cls = student.classId?.name ? student.classId : await Class.findById(classId);
    const studentStandard = cls ? normalizeStandard(cls.name) : null;
    if (feeStructure.standard !== studentStandard) {
      return res.status(400).json({ success: false, message: 'Fee structure does not match student class' });
    }

    // 3. Find the requested component
    const component = feeStructure.components.find(c => c.name === componentName);
    if (!component) {
      return res.status(404).json({ success: false, message: 'Component not found in fee structure' });
    }

    // 4. Check already paid
    const existing = await StudentFeePayment.findOne({
      studentId, feeStructureId, componentName, status: 'paid',
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `${componentName} is already paid` });
    }

    // 5. Enforce term order — only the first unpaid component can be paid
    const { unpaid } = await getNextPayableComponent(studentId, feeStructureId);
    if (unpaid.length === 0) {
      return res.status(400).json({ success: false, message: 'All fees are already paid' });
    }
    if (unpaid[0].name !== componentName) {
      return res.status(400).json({
        success: false,
        message: `Please pay "${unpaid[0].name}" first before paying "${componentName}"`,
      });
    }

    // 6. Check for existing unpaid order for this exact component
    const pendingOrder = await Payment.findOne({
      studentId, feeStructureId, componentName, status: 'created',
    });
    if (pendingOrder) {
      // Return existing order so frontend can retry payment
      return res.json({
        success: true,
        data: {
          orderId: pendingOrder.razorpayOrderId,
          amount: pendingOrder.amount * 100, // paise
          currency: 'INR',
          keyId: process.env.RAZORPAY_KEY_ID,
          studentName: student.userId?.name || 'Student',
          componentName,
        },
      });
    }

    // 7. Create Razorpay order
    const order = await getRazorpay().orders.create({
      amount: component.amount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `fee_${Date.now()}`,
      notes: {
        studentId: String(studentId),
        feeStructureId: String(feeStructureId),
        componentName,
      },
    });

    // 8. Save payment record
    await Payment.create({
      studentId,
      parentId: parent._id,
      feeStructureId,
      componentName,
      amount: component.amount,
      razorpayOrderId: order.id,
      schoolId: req.user.schoolId,
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount, 
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        studentName: student.userId?.name || 'Student',
        componentName,
      },
    });
  } catch (err) {
    console.error('[createOrder] error:', err.message, err.statusCode || '', JSON.stringify(err.error || ''));
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    if (err.statusCode || err.error) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.error?.description || err.message || 'Payment gateway error',
      });
    }
    next(err);
  }
};

// ── POST /api/payments/verify ────────────────────────────────────────────────
// Verify Razorpay payment signature and mark fee as paid
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'razorpayOrderId, razorpayPaymentId and razorpaySignature are required' });
    }

    // 1. Find payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment order not found' });
    }
    if (payment.status === 'paid') {
      return res.json({ success: true, message: 'Payment already verified', data: payment });
    }

    // 2. Verify parent owns this payment
    const parent = await Parent.findOne({ userId: req.user.userId });
    if (!parent || String(parent._id) !== String(payment.parentId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // 3. Verify Razorpay signature (HMAC SHA256)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    // 4. Mark payment as paid
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    // 5. Update StudentFeePayment (this is what admin sees)
    await StudentFeePayment.findOneAndUpdate(
      { studentId: payment.studentId, feeStructureId: payment.feeStructureId, componentName: payment.componentName },
      {
        $set: {
          amount: payment.amount,
          status: 'paid',
          paidAt: payment.paidAt,
        },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Payment verified and fee marked as paid', data: payment });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/payments/history/:studentId ─────────────────────────────────────
// Parent views payment history for a child
export const getPaymentHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    await validateParentChild(req.user.userId, studentId);

    const payments = await Payment.find({ studentId, status: 'paid' })
      .populate('feeStructureId', 'standard academicYear')
      .sort({ paidAt: -1 });

    res.json({ success: true, data: payments });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

// ── GET /api/payments/fee-details/:studentId ─────────────────────────────────
// Get fee structure + payment status for a student (parent view)
export const getStudentFeeDetails = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { parent, student } = await validateParentChild(req.user.userId, studentId);

    // student.classId may be populated (object) or a plain ObjectId
    const classId = student.classId?._id || student.classId;
    const cls = student.classId?.name ? student.classId : await Class.findById(classId);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

    const standard = normalizeStandard(cls.name);
    const resolvedClassId = cls._id || classId;

    // Find applicable fee structure (class-specific first, then standard-wide)
    let feeStructure = await FeeStructure.findOne({ standard, classId: resolvedClassId });
    if (!feeStructure) {
      feeStructure = await FeeStructure.findOne({ standard, classId: null });
    }
    if (!feeStructure) {
      return res.json({ success: true, data: { feeStructure: null, components: [], totalPaid: 0, totalPending: 0 } });
    }

    // Get payment status per component
    const payments = await StudentFeePayment.find({
      studentId, feeStructureId: feeStructure._id,
    });
    const paymentMap = {};
    for (const p of payments) {
      paymentMap[p.componentName] = { status: p.status, paidAt: p.paidAt };
    }

    let totalPaid = 0;
    let firstUnpaidFound = false;
    const components = feeStructure.components.map(c => {
      const isPaid = paymentMap[c.name]?.status === 'paid';
      if (isPaid) totalPaid += c.amount;
      const canPay = !isPaid && !firstUnpaidFound;
      if (!isPaid && !firstUnpaidFound) firstUnpaidFound = true;
      return {
        name: c.name,
        amount: c.amount,
        dueDate: c.dueDate,
        status: isPaid ? 'paid' : 'pending',
        paidAt: paymentMap[c.name]?.paidAt || null,
        canPay, // only the first unpaid component
      };
    });

    const totalFees = feeStructure.components.reduce((s, c) => s + c.amount, 0);

    res.json({
      success: true,
      data: {
        feeStructure: {
          _id: feeStructure._id,
          standard: feeStructure.standard,
          academicYear: feeStructure.academicYear,
          totalFees: feeStructure.totalFees,
        },
        components,
        totalPaid,
        totalPending: totalFees - totalPaid,
      },
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};
