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

const ALLOWED_TYPES = new Set([
  'application/pdf', 'image/jpeg', 'image/png', 'image/gif',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'application/zip',
]);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error('Invalid file type. Only documents, images, and archives are allowed.'));
    }
    cb(null, true);
  },
});

const router = Router();
router.use(protect);

router.get('/', getDocuments);
router.get('/:id/download', authorize('admin', 'staff', 'student', 'parent'), downloadDocument);
router.post('/', authorize('admin'), upload.single('file'), uploadDocument);
router.delete('/:id', authorize('admin'), deleteDocument);

export default router;
