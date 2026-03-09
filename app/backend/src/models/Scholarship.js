import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['full', 'partial', 'merit', 'need-based'], default: 'partial' },
  criteria: { type: String }, // e.g. "Min 90% marks", "BPL family", etc.
  academicYear: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'disbursed'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedOn: { type: Date },
  disbursedOn: { type: Date },
  remarks: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

scholarshipSchema.index({ studentId: 1, academicYear: 1 });

export default mongoose.model('Scholarship', scholarshipSchema);
