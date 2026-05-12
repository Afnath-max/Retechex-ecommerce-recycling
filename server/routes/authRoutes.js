// server/routes/authRoutes.js
import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  verifyOTP,
  resendOTP,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// IMPORTANT: only one register route, with multer
router.post('/register', upload.single('image'), register);

router.post('/login', login);
router.post('/verify-otp', authenticateToken, verifyOTP);
router.post('/resend-otp', authenticateToken, resendOTP);
router.get('/me', authenticateToken, getMe);

// Forgot password routes (public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// (optional) allow profile update with a new image as well
router.put('/profile', authenticateToken, upload.single('image'), updateProfile);

router.put('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);

export default router;