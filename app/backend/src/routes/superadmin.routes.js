import { Router } from 'express';
import { protectSuperAdmin } from '../middleware/superadminAuth.js';
import {
  saLogin, saLogout, saMe,
  saGetStats,
  saGetSchools, saGetSchool, saUpdateSchool, saDeleteSchool,
  saUpdateSubscription, saPauseSchool, saResumeSchool, saSuspendSchool,
} from '../controllers/superadmin.controller.js';

const router = Router();

// Auth (public)
router.post('/auth/login', saLogin);
router.post('/auth/logout', saLogout);
router.get('/auth/me', protectSuperAdmin, saMe);

// Dashboard stats
router.get('/stats', protectSuperAdmin, saGetStats);

// Schools
router.get('/schools', protectSuperAdmin, saGetSchools);
router.get('/schools/:id', protectSuperAdmin, saGetSchool);
router.put('/schools/:id', protectSuperAdmin, saUpdateSchool);
router.delete('/schools/:id', protectSuperAdmin, saDeleteSchool);

// Subscription actions
router.put('/schools/:id/subscription', protectSuperAdmin, saUpdateSubscription);
router.post('/schools/:id/pause', protectSuperAdmin, saPauseSchool);
router.post('/schools/:id/resume', protectSuperAdmin, saResumeSchool);
router.post('/schools/:id/suspend', protectSuperAdmin, saSuspendSchool);

export default router;
