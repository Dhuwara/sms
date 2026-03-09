import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: String, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  dueDate: { type: Date, required: true },
  attachments: [{
    filename: { type: String },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
  }],
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Homework', homeworkSchema);
