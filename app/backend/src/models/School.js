import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  schoolType: { type: String, enum: ['matriculation', 'cbse', 'state_board', 'govt', 'international', 'other'], default: 'other' },
  address1: { type: String, required: true, trim: true },
  address2: { type: String, default: '', trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  logo: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('School', schoolSchema);
