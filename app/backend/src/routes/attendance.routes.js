import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getAttendance, markAttendance, updateAttendance } from '../controllers/staff.controller.js';

const router = Router();
router.use(protect, authorize('admin', 'staff'));

router.get('/', getAttendance);
router.post('/', markAttendance);
router.put('/:id', updateAttendance);

export default router;
