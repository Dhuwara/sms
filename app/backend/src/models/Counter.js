import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  prefix: { type: String, default: '' },
  format: { type: String, default: '{{YYYY}}', enum: ['{{YYYY}}', '{{YY}}', '{{YY/MM}}', '{{YYMM}}', ''] },
  start: { type: Number, default: 1 },
  padding: { type: Number, default: 3 },
  current: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Counter', counterSchema);
