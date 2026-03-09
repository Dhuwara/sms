import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  type: { type: String, enum: ['class', 'break', 'lunch', 'sports', 'lab', 'assembly'], default: 'class' },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], default: 'Monday' },
  subject: { type: String, default: '' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
}, { _id: false });

const periodConfigSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  academicYear: { type: String, required: true },
  periods: [periodSchema],
}, { timestamps: true });

periodConfigSchema.index({ classId: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('PeriodConfig', periodConfigSchema);
