import mongoose from 'mongoose';

const homeworkSubmissionSchema = new mongoose.Schema({
  homeworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  submittedAt: { type: Date, default: Date.now },
  content: { type: String },
  grade: { type: String },
  remarks: { type: String },
  status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
}, { timestamps: true });

homeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);
