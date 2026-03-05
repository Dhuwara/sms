import mongoose from 'mongoose';

const feeTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  dueDate: { type: Date },
  category: {
    type: String,
    enum: ['tuition', 'transport', 'library', 'sports', 'hostel', 'other'],
    default: 'other',
  },
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual', 'one-time'],
    default: 'quarterly',
  },
}, { timestamps: true });

export default mongoose.model('FeeType', feeTypeSchema);
