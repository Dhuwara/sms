import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: String, required: true },
  description: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String },
  size: { type: Number },
}, { timestamps: true });

export default mongoose.model('StudyMaterial', studyMaterialSchema);
