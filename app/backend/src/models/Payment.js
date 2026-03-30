import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  parentId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  componentName:  { type: String, required: true },
  amount:         { type: Number, required: true },

  // Razorpay fields
  razorpayOrderId:   { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },

  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

paymentSchema.index({ studentId: 1, feeStructureId: 1, componentName: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

export default mongoose.model('Payment', paymentSchema);
