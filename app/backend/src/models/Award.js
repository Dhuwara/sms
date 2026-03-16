import mongoose from 'mongoose';

const awardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  category: { type: String, enum: ['academic', 'sports', 'arts', 'science', 'leadership', 'community', 'other'], default: 'academic' },
  awardDate: { type: Date, required: true },
  academicYear: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  position: { type: String }, // e.g. "1st", "2nd", "Gold Medal"
  eventName: { type: String }, // e.g. "Inter-School Science Fair"
  remarks: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

awardSchema.index({ studentId: 1, academicYear: 1 });

export default mongoose.model('Award', awardSchema);
