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
  whatsappNumber: { type: String, default: '' },
  whatsappPhoneNumberId: { type: String, default: '' },
  logo: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'paused', 'suspended', 'expired'], default: 'active' },
    billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
    startDate: { type: Date },
    endDate: { type: Date },
    pausedAt: { type: Date },
    pauseReason: { type: String, default: '' },
    suspendedAt: { type: Date },
    suspendReason: { type: String, default: '' },
    maxStudents: { type: Number, default: 500 },
    maxStaff: { type: Number, default: 50 },
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('School', schoolSchema);
