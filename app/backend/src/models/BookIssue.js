import mongoose from 'mongoose';

const bookIssueSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  issuedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnedAt: { type: Date },
  status: { type: String, enum: ['active', 'returned', 'overdue'], default: 'active' },
  fine: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('BookIssue', bookIssueSchema);
