import mongoose from 'mongoose';

const reimbursementSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Reimbursement', reimbursementSchema);
