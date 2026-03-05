import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subjectsTaught: [{ type: String }],
  classesAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  contact: { type: String },
  qualification: { type: String },
  qualificationDegree: { type: String },
  qualificationSpecialization: { type: String },
  experience: { type: String },
  employeeId: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'on_leave', 'resigned'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);
