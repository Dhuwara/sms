import mongoose from 'mongoose';

const classMappingSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  academicYear: { type: String, required: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  subjectTeachers: { type: Map, of: String, default: {} },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

classMappingSchema.index({ classId: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('ClassMapping', classMappingSchema);
