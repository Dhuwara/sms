import { Router } from 'express';
import { signup, getSchools, login, logout, refresh, getMe, forgotPassword, resetPassword, changePassword, updateProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { loginLimiter, forgotPasswordLimiter, refreshLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/signup', signup);
router.get('/schools', getSchools);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refreshLimiter, refresh);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', protect, changePassword);
router.put('/update-profile', protect, updateProfile);

export default router;
