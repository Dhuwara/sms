import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { protect, authorize } from '../middleware/auth.js';
import {
  getHomework, createHomework, updateHomework, deleteHomework,
  getSubmissions, submitHomework, gradeSubmission,
  getMyHomework, getMyAssignedHomework, downloadAttachment,
} from '../controllers/homework.controller.js';

const uploadDir = path.join(process.cwd(), 'uploads', 'homework');
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

router.get('/', authorize('admin', 'staff'), getHomework);
router.post('/', authorize('admin', 'staff'), upload.array('files', 5), createHomework);
router.put('/:id', authorize('admin', 'staff'), updateHomework);
router.delete('/:id', authorize('admin', 'staff'), deleteHomework);

router.get('/my-homework', authorize('student'), getMyHomework);
router.get('/my-assigned', authorize('staff', 'admin'), getMyAssignedHomework);
router.get('/:id/submissions', authorize('admin', 'staff'), getSubmissions);
router.get('/:id/attachments/:filename', downloadAttachment);
router.post('/:id/submit', authorize('student'), submitHomework);
router.put('/submissions/:submissionId/grade', authorize('admin', 'staff'), gradeSubmission);

export default router;
