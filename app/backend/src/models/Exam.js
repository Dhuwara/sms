import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  examType: { type: String, enum: ['CAT-1', 'CAT-2', 'Quarterly', 'Half Yearly', 'Revision-1', 'Revision-2', 'Annual'], required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: String, required: true }, // Subject name as string
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // HH:mm format
  endTime: { type: String, required: true }, // HH:mm format
  period: { type: Number }, // in minutes (calculated from startTime and endTime)
  session: { type: String, enum: ['Forenoon', 'Afternoon'], default: 'Forenoon' },
  invigilatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  maxScore: { type: Number, default: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Calculate period from startTime and endTime
examSchema.pre('save', function (next) {
  if (this.startTime && this.endTime) {
    const [startHours, startMins] = this.startTime.split(':').map(Number);
    const [endHours, endMins] = this.endTime.split(':').map(Number);
    const startTotalMins = startHours * 60 + startMins;
    const endTotalMins = endHours * 60 + endMins;
    this.period = endTotalMins - startTotalMins;
  }
  next();
});

export default mongoose.model('Exam', examSchema);
