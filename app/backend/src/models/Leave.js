import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  leaveType: { type: String, enum: ['casual', 'sick'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  approvers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String },
    approved: { type: Boolean, default: null },
  }],
  appliedOn: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);
