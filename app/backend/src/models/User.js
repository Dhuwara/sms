import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'staff', 'student', 'parent'], required: true },
  schoolId: { type: String, default: 'default' },
  resetToken: { type: String, select: false },
  resetTokenExpiry: { type: Date, select: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
