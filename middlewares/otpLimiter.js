// src/middlewares/otpLimiter.js
import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // allow max 3 requests per window per IP (resend)
  message: {
    message: 'Too many OTP requests from this IP, try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default otpLimiter;
