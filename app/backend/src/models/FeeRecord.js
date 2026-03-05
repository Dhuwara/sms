import mongoose from 'mongoose';

const feeRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: 'Tuition Fee' },
  paidAt: { type: Date },
  dueDate: { type: Date },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('FeeRecord', feeRecordSchema);
