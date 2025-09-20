// sign-natural-api/index.js
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import workshopRoutes from './src/routes/workshopRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import testimonialRoutes from './src/routes/testimonialRoutes.js';
import productRoutes from './src/routes/productRoutes.js';

import { notFound, errorHandler } from './src/middlewares/errorMiddleware.js';
import User from './src/models/User.js';
import { verifyTransporter } from './src/utils/email.js'; // optional: verify SMTP

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// API routes (mount before or after DB connect — mounting is independent)
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/products', productRoutes);

// health
app.get('/api/health', (req, res) => res.json({ ok: true, now: Date.now() }));

// 404 + error middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // 1) Connect DB and wait
    await connectDB();
    console.log('MongoDB connected');

    // 2) Verify SMTP transporter (non-blocking if verifyTransporter returns false)
    try {
      const smtpOk = await verifyTransporter();
      if (!smtpOk) console.warn('Warning: SMTP verify failed. OTP/email may not send.');
    } catch (err) {
      console.warn('SMTP verify threw:', err && err.message ? err.message : err);
    }

    // 3) Bootstrap initial admin (only after DB connected)
    // try {
    //   const existingAdmin = await User.findOne({ role: 'admin' }).lean();
    //   if (!existingAdmin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    //     const u = new User({
    //       name: process.env.ADMIN_NAME || 'Admin',
    //       email: process.env.ADMIN_EMAIL,
    //       password: process.env.ADMIN_PASSWORD,
    //       role: 'admin',
    //       emailVerified: true   // <-- permanent fix: mark bootstrap admin as verified
    //     });
    //     await u.save();
    //     console.log('Bootstrapped initial admin:', u.email);
    //   }
    // } catch (err) {
    //   console.error('Bootstrap admin error:', err);
    // }

    // 4) Start server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

start();
