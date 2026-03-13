import mongoose from 'mongoose';

const bookIssueSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  issuedToType: { type: String, enum: ['student', 'staff'], default: 'student' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  issuedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnedAt: { type: Date },
  status: { type: String, enum: ['active', 'returned', 'overdue'], default: 'active' },
  fine: { type: Number, default: 0 },
  fineStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
}, { timestamps: true });

export default mongoose.model('BookIssue', bookIssueSchema);
