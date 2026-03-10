import mongoose from 'mongoose';

const schoolEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  eventType: { 
    type: String, 
    enum: ['holiday', 'exam', 'meeting', 'sports', 'cultural', 'academic', 'other'],
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String },
  targetAudience: [{ 
    type: String, 
    enum: ['all', 'students', 'staff', 'parents', 'specific-class'],
    default: ['all']
  }],
  specificClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  attachments: [{
    filename: { type: String },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for better query performance
schoolEventSchema.index({ startDate: 1, endDate: 1 });
schoolEventSchema.index({ targetAudience: 1 });
schoolEventSchema.index({ status: 1 });

export default mongoose.model('SchoolEvent', schoolEventSchema);
