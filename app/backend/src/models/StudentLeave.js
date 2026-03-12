import mongoose from 'mongoose';

const studentLeaveSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }, // Class Teacher
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  leaveType: { type: String, enum: ['casual', 'sick', 'other'], default: 'casual' },
  
  parentApproval: {
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    reason: { type: String, default: '' },
    updatedAt: { type: Date }
  },
  
  staffApproval: {
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    reason: { type: String, default: '' },
    updatedAt: { type: Date }
  },
  
  status: { 
    type: String, 
    enum: ['pending_parent', 'pending_staff', 'approved', 'denied'], 
    default: 'pending_parent' 
  },
  
  appliedOn: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('StudentLeave', studentLeaveSchema);
