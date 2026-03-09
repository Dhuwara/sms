import mongoose from 'mongoose';

const lessonPlanSchema = new mongoose.Schema({
    title: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
    academicYear: { type: String },
    // File metadata
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
}, { timestamps: true });

export default mongoose.model('LessonPlan', lessonPlanSchema);
