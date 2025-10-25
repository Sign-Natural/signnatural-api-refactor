// sign-natural-api/index.js
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import workshopRoutes from './routes/workshopRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import productRoutes from './routes/productRoutes.js';

import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import { verifyTransporter } from './utils/email.js';
import notificationRoutes from './routes/notificationRoutes.js';
import notificationStreamRoutes from './routes/notificationStreamRoutes.js';

const app = express();

/** Behind a proxy on Render: trust X-Forwarded-* */
app.set('trust proxy', 1);

/** Security & body parsing */
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/** Logging */
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/** CORS (single, centralized setup) */
const allowedOrigins = [
  process.env.FRONTEND_URL,      // e.g. https://your-site.netlify.app
  'http://localhost:5173',       // Vite dev
  'http://localhost:3000',       // CRA/other dev
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Soft-fail with a CORS error (shows as 200 on OPTIONS preflight)
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

/** Rate limiting (after trust proxy so req.ip is correct) */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/** Routes */
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes)
app.use('/api/notifications', notificationStreamRoutes);

/** Health check */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, now: Date.now(), ip: req.ip });
});

/** 404 + error handlers (must be last) */
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    console.log('MongoDB connected');

    // Non-blocking SMTP verification
    try {
      const smtpOk = await verifyTransporter();
      if (!smtpOk) console.warn('Warning: SMTP verify failed. OTP/email may not send.');
    } catch (err) {
      console.warn('SMTP verify threw:', err?.message || err);
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err?.message || err);
    process.exit(1);
  }
}

start();
