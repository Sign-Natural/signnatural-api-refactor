// backend/src/routes/authRoutes.js
import express from 'express';
import { registerUser, verifyEmail, resendOtp, loginUser } from '../controllers/authController.js';
import otpLimiter  from '../middlewares/otpLimiter.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);         // public: creates user + sends OTP
router.post('/verify-email', verifyEmail);      // public: verify OTP -> returns JWT
router.post('/resend-otp', otpLimiter, resendOtp); // throttle resends

router.post('/login', loginUser);

// Admin-only create admin endpoint is still separate and should require admin auth.
// e.g. router.post('/admin', protect, requireAdmin, createAdmin);

export default router;
