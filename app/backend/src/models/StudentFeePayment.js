import mongoose from 'mongoose';

const studentFeePaymentSchema = new mongoose.Schema({
  studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  componentName:  { type: String, required: true },
  amount:         { type: Number, required: true },
  status:         { type: String, enum: ['paid', 'pending'], default: 'pending' },
  paidAt:         { type: Date, default: null },
}, { timestamps: true });

studentFeePaymentSchema.index({ studentId: 1, feeStructureId: 1, componentName: 1 }, { unique: true });

export default mongoose.model('StudentFeePayment', studentFeePaymentSchema);
