import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { protect, authorize } from '../middleware/auth.js';
import {
    getStudyMaterials, uploadStudyMaterial, downloadStudyMaterial, deleteStudyMaterial,
    getMyStudyMaterials,
} from '../controllers/studyMaterial.controller.js';

const uploadDir = path.join(process.cwd(), 'uploads', 'study-materials');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    },
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const router = Router();
router.use(protect);

router.get('/my-materials', authorize('student'), getMyStudyMaterials);
router.get('/', authorize('staff', 'admin'), getStudyMaterials);
router.post('/', authorize('staff', 'admin'), upload.single('file'), uploadStudyMaterial);
router.get('/:id/download', authorize('staff', 'admin', 'student'), downloadStudyMaterial);
router.delete('/:id', authorize('staff', 'admin'), deleteStudyMaterial);

export default router;
