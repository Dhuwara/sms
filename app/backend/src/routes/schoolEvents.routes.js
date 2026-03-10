import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { protect, authorize } from '../middleware/auth.js';
import {
  getSchoolEvents,
  getSchoolEventById,
  createSchoolEvent,
  updateSchoolEvent,
  deleteSchoolEvent,
  getEventsForUser
} from '../controllers/schoolEvents.controller.js';

const uploadDir = path.join(process.cwd(), 'uploads', 'events');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();
router.use(protect);

// Public routes for all authenticated users
router.get('/user-events', getEventsForUser);

// Admin/Staff routes for event management
router.get('/', authorize('admin', 'staff'), getSchoolEvents);
router.get('/:id', authorize('admin', 'staff'), getSchoolEventById);
router.post('/', authorize('admin', 'staff'), upload.array('files', 3), createSchoolEvent);
router.put('/:id', authorize('admin', 'staff'), upload.array('files', 3), updateSchoolEvent);
router.delete('/:id', authorize('admin', 'staff'), deleteSchoolEvent);

export default router;
