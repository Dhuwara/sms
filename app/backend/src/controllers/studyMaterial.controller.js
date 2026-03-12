import fs from 'fs';
import path from 'path';
import StudyMaterial from '../models/StudyMaterial.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';

export const getStudyMaterials = async (req, res, next) => {
    try {
        const staff = await Staff.findOne({ userId: req.user.userId });
        if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });

        const filter = { uploadedBy: staff._id };
        if (req.query.classId) filter.classId = req.query.classId;

        const materials = await StudyMaterial.find(filter)
            .populate('classId', 'name section')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: materials });
    } catch (err) { next(err); }
};

export const uploadStudyMaterial = async (req, res, next) => {
    try {
        const staff = await Staff.findOne({ userId: req.user.userId });
        if (!staff) return res.status(404).json({ success: false, message: 'Staff profile not found' });
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const { title, classId, subject, description } = req.body;
        const material = await StudyMaterial.create({
            title,
            classId,
            subject,
            description,
            uploadedBy: staff._id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
        });

        const populated = await StudyMaterial.findById(material._id).populate('classId', 'name section');
        res.status(201).json({ success: true, data: populated });
    } catch (err) { next(err); }
};

export const downloadStudyMaterial = async (req, res, next) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Study material not found' });

        const filePath = path.join(process.cwd(), 'uploads', 'study-materials', material.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found on server' });

        res.download(filePath, material.originalName);
    } catch (err) { next(err); }
};

export const deleteStudyMaterial = async (req, res, next) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Study material not found' });

        const filePath = path.join(process.cwd(), 'uploads', 'study-materials', material.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await material.deleteOne();
        res.json({ success: true, message: 'Study material deleted' });
    } catch (err) { next(err); }
};

// Student-facing: get study materials for the student's class
export const getMyStudyMaterials = async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user.userId });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const materials = await StudyMaterial.find({ classId: student.classId })
            .populate('classId', 'name section')
            .populate({
                path: 'uploadedBy',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: materials });
    } catch (err) { next(err); }
};
