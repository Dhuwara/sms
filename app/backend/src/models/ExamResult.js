import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  marks: { type: Number, required: true },
  grade: { type: String },
  remarks: { type: String },
}, { timestamps: true });

examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

examResultSchema.pre('save', function (next) {
  const pct = (this.marks / 100) * 100;
  if (pct >= 90) this.grade = 'A+';
  else if (pct >= 80) this.grade = 'A';
  else if (pct >= 70) this.grade = 'B+';
  else if (pct >= 60) this.grade = 'B';
  else if (pct >= 50) this.grade = 'C';
  else this.grade = 'F';
  next();
});

export default mongoose.model('ExamResult', examResultSchema);
