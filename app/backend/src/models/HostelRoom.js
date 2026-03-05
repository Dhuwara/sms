import mongoose from 'mongoose';

const hostelRoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: String },
  type: { type: String, enum: ['single', 'double', 'dormitory'], default: 'double' },
  capacity: { type: Number, default: 2 },
  occupancy: { type: Number, default: 0 },
  status: { type: String, enum: ['available', 'full', 'maintenance'], default: 'available' },
}, { timestamps: true });

export default mongoose.model('HostelRoom', hostelRoomSchema);
