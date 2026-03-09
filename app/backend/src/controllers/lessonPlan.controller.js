import fs from 'fs';
import path from 'path';
import LessonPlan from '../models/LessonPlan.js';
import Staff from '../models/Staff.js';

export const getLessonPlans = async (req, res, next) => {
    try {
        const staff = await Staff.findOne({ userId: req.user.userId });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff profile not found' });
        }

        const filter = { uploadedBy: staff._id };
        if (req.query.classId) filter.classId = req.query.classId;

        const plans = await LessonPlan.find(filter)
            .populate('classId', 'name section')
            .sort({ date: -1 });

        res.json({ success: true, data: plans });
    } catch (err) {
        next(err);
    }
};

export const getLessonPlanDetails = async (req, res, next) => {
    try {
        const plan = await LessonPlan.findById(req.params.id)
            .populate('classId', 'name section')
            .populate({
                path: 'uploadedBy',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            });

        if (!plan) {
            return res.status(404).json({ success: false, message: 'Lesson plan not found' });
        }

        res.json({ success: true, data: plan });
    } catch (err) {
        next(err);
    }
};

export const uploadLessonPlan = async (req, res, next) => {
    try {
        const staff = await Staff.findOne({ userId: req.user.userId });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff profile not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { title, classId, subject, date } = req.body;

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const academicYear = currentMonth >= 5 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

        const newPlan = await LessonPlan.create({
            title,
            classId,
            subject,
            date: new Date(date),
            uploadedBy: staff._id,
            academicYear,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size
        });

        const populated = await LessonPlan.findById(newPlan._id).populate('classId', 'name section');
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
};

export const downloadLessonPlan = async (req, res, next) => {
    try {
        const plan = await LessonPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Lesson plan not found' });
        }

        const filePath = path.join(process.cwd(), 'uploads', 'lesson-plans', plan.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        res.download(filePath, plan.originalName);
    } catch (err) {
        next(err);
    }
};

export const deleteLessonPlan = async (req, res, next) => {
    try {
        const plan = await LessonPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Lesson plan not found' });
        }

        // Optional: Only allow the person who uploaded it (or admin) to delete it
        // For simplicity, we just delete it here based on Authorization guard

        const filePath = path.join(process.cwd(), 'uploads', 'lesson-plans', plan.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await plan.deleteOne();
        res.json({ success: true, message: 'Lesson plan deleted successfully' });
    } catch (err) {
        next(err);
    }
};
