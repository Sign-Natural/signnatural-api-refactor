import express from 'express';
import dotenv from 'dotenv';
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



import  productRoutes from './src/routes/productRoutes.js'
import { notFound, errorHandler } from './src/middlewares/errorMiddleware.js';
import otpLimiter from "./src/middlewares/otpLimiter.js";
import User from './src/models/User.js';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/products', productRoutes);

// health
app.get('/api/health', (req, res) => res.json({ ok: true, now: Date.now() }));

// bootstrap initial admin if none exist and env vars set
(async function bootstrapAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' }).lean();
    if (!existingAdmin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const u = new User({
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      await u.save();
      console.log('Bootstrapped initial admin:', u.email);
    }
  } catch (err) {
    console.error('Bootstrap admin error:', err);
  }
})();

// 404 + error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
