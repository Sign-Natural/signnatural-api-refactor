// /src/routes/authRoutes.js
import express from 'express';
import {
  registerUser,
  verifyEmail,
  resendOtp,
  loginUser,
  createAdmin,
  getMe
} from '../controllers/authController.js';

import otpLimiter  from '../middlewares/otpLimiter.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  createAdminSchema
} from '../validators/authSchemas.js';  // <-- plural here

const router = express.Router();

// Public
router.post('/register', validate(registerSchema), registerUser);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), resendOtp);
router.post('/login', validate(loginSchema), loginUser);

// Protected
router.get('/me', protect, getMe);

// Admin-only: create another admin
router.post('/admin', protect, requireAdmin, validate(createAdminSchema), createAdmin);

export default router;
