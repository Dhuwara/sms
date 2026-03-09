import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { protect, authorize } from '../middleware/auth.js';
import {
    getStudyMaterials, uploadStudyMaterial, downloadStudyMaterial, deleteStudyMaterial,
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
router.use(protect, authorize('staff', 'admin'));

router.get('/', getStudyMaterials);
router.post('/', upload.single('file'), uploadStudyMaterial);
router.get('/:id/download', downloadStudyMaterial);
router.delete('/:id', deleteStudyMaterial);

export default router;
