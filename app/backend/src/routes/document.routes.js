import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDocuments, uploadDocument, downloadDocument, deleteDocument,
} from '../controllers/document.controller.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'documents'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();
router.use(protect);

router.get('/', getDocuments);
router.get('/:id/download', downloadDocument);
router.post('/', authorize('admin'), upload.single('file'), uploadDocument);
router.delete('/:id', authorize('admin'), deleteDocument);

export default router;
