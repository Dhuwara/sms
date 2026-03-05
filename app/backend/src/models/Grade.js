import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  marks: { type: Number, required: true },
  maxMarks: { type: Number, default: 100 },
  examType: { type: String, required: true },
  term: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Grade', gradeSchema);
