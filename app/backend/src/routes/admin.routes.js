import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getStats, getUsers, createUser, updateUser, deleteUser,
  getClasses, createClass, updateClass, deleteClass,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getAttendanceReport, getFeeReport,
  getPendingLeaves, adminApproveRejectLeave,
} from '../controllers/admin.controller.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/stats', getStats);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

router.get('/reports/attendance', getAttendanceReport);
router.get('/reports/fees', getFeeReport);

router.get('/leaves/pending', getPendingLeaves);
router.put('/leaves/:leaveId/action', adminApproveRejectLeave);

export default router;
