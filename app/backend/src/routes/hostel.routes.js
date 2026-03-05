import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getRooms, createRoom, updateRoom, deleteRoom,
  getAllocations, createAllocation, deleteAllocation,
} from '../controllers/hostel.controller.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

router.get('/allocations', getAllocations);
router.post('/allocations', createAllocation);
router.delete('/allocations/:id', deleteAllocation);

export default router;
