import mongoose from 'mongoose';

const gradeEntrySchema = new mongoose.Schema({
  label: { type: String, required: true },       // e.g. 'A+', 'A', 'B+'
  minPercent: { type: Number, required: true },   // e.g. 90
  maxPercent: { type: Number, required: true },   // e.g. 100
  points: { type: Number, default: 0 },           // e.g. 10
}, { _id: false });

const gradeConfigSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, unique: true },
  grades: [gradeEntrySchema],
}, { timestamps: true });

export default mongoose.model('GradeConfig', gradeConfigSchema);
