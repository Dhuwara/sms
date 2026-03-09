import mongoose from 'mongoose';

const staffAttendanceSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  workingHours: { type: Number }, // in minutes
  status: { type: String, enum: ['present', 'late', 'absent'], default: 'absent' },
}, { timestamps: true });

staffAttendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

export default mongoose.model('StaffAttendance', staffAttendanceSchema);
