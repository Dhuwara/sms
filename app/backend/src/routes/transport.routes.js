import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getRoutes, createRoute, updateRoute, deleteRoute,
  getAssignments, createAssignment, deleteAssignment,
} from '../controllers/transport.controller.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/routes', getRoutes);
router.post('/routes', createRoute);
router.put('/routes/:id', updateRoute);
router.delete('/routes/:id', deleteRoute);

router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.delete('/assignments/:id', deleteAssignment);

export default router;
