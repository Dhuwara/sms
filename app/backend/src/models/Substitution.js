import mongoose from 'mongoose';

const substitutionSchema = new mongoose.Schema({
  originalTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  substituteTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true },
  periodIndex: { type: Number, required: true },
  subject: { type: String },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'confirmed'], default: 'confirmed' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

substitutionSchema.index({ substituteTeacherId: 1, date: 1 });
substitutionSchema.index({ originalTeacherId: 1, date: 1 });

export default mongoose.model('Substitution', substitutionSchema);
