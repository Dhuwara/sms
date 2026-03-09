import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['policy', 'handbook', 'circular', 'training', 'general'], default: 'general' },
  description: { type: String },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String },
  size: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, enum: ['all', 'staff', 'students', 'parents'], default: 'all' },
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
