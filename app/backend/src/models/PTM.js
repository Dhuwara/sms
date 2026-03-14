import mongoose from 'mongoose';

const ptmSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  date:           { type: Date, required: true },
  time:           { type: String, required: true },  // e.g. "10:00 AM - 1:00 PM"
  venue:          { type: String, required: true },
  targetAudience: { type: String, enum: ['all', 'class'], default: 'all' },
  classIds:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  notes:          { type: String, default: '' },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('PTM', ptmSchema);
