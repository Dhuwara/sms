import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  gradeLevel: { type: Number },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  capacity: { type: Number, default: 40 },
  roomNumber: { type: String, default: '' },
  subjects: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Class', classSchema);
