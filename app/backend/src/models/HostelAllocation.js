import mongoose from 'mongoose';

const hostelAllocationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'HostelRoom', required: true },
  checkIn: { type: Date, default: Date.now },
  checkOut: { type: Date },
  status: { type: String, enum: ['active', 'vacated'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('HostelAllocation', hostelAllocationSchema);
