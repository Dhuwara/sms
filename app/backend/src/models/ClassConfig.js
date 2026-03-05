import mongoose from 'mongoose';

const classConfigSchema = new mongoose.Schema({
  prefix: { type: String, default: '' },
  standardFormat: { type: String, enum: ['number', 'roman'], default: 'number' },
  sectionFormat: { type: String, enum: ['ABC', 'roman'], default: 'ABC' },
}, { timestamps: true });

export default mongoose.model('ClassConfig', classConfigSchema);
