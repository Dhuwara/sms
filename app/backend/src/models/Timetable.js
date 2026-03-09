import mongoose from 'mongoose';

const dayEntrySchema = new mongoose.Schema({
  periodIndex: { type: Number, required: true },
  subject: { type: String, default: '' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  academicYear: { type: String, required: true },
  schedule: {
    Monday: [dayEntrySchema],
    Tuesday: [dayEntrySchema],
    Wednesday: [dayEntrySchema],
    Thursday: [dayEntrySchema],
    Friday: [dayEntrySchema],
    Saturday: [dayEntrySchema],
  },
}, { timestamps: true });

timetableSchema.index({ classId: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('Timetable', timetableSchema);
