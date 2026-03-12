import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { protect, authorize } from '../middleware/auth.js';
import {
    getLessonPlans,
    getLessonPlanDetails,
    uploadLessonPlan,
    downloadLessonPlan,
    deleteLessonPlan,
    getMyLessonPlans
} from '../controllers/lessonPlan.controller.js';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'lesson-plans');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Only allow specific types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
        }
    }
});

const router = Router();
router.use(protect); // Need to be logged in

router.get('/my-plans', authorize('student'), getMyLessonPlans);
router.get('/', authorize('staff', 'admin'), getLessonPlans);
router.get('/:id', authorize('staff', 'admin', 'student'), getLessonPlanDetails);
router.post('/', authorize('staff', 'admin'), upload.single('file'), uploadLessonPlan);
router.get('/:id/download', authorize('staff', 'admin', 'student'), downloadLessonPlan);
router.delete('/:id', authorize('staff', 'admin'), deleteLessonPlan);

export default router;
