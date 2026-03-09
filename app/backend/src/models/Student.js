import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
  rollNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  address: { type: String },
  parentContact: { type: String },
  studentType: { type: String, enum: ['dayScholar', 'hosteller'], default: 'dayScholar' },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'transferred'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
