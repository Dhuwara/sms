import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  prefix: { type: String, default: '' },
  format: { type: String, default: '{{YYYY}}', enum: ['{{YYYY}}', '{{YY}}', '{{YY/MM}}', '{{YYMM}}', ''] },
  start: { type: Number, default: 1 },
  padding: { type: Number, default: 3 },
  current: { type: Number, default: 0 },
}, { timestamps: true });

counterSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export default mongoose.model('Counter', counterSchema);
