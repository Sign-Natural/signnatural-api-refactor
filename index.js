// sign-natural-api/index.js
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { verifyTransporter } from './utils/email.js';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import workshopRoutes from './routes/workshopRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import productRoutes from './routes/productRoutes.js';

import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

/**
 * Basic app configuration
 */
app.set('trust proxy', true); // important when behind proxies/load balancers (Render, Netlify functions, etc.)

// Security headers
app.use(helmet());

// Logging (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/**
 * Body parsing
 * - Increase limits for potential form uploads (small images are uploaded as multipart/form-data via multer)
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * CORS configuration
 * - Allow the frontend domain(s), and localhost for development.
 * - Add FRONTEND_URL in your environment for the deployed Netlify URL.
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,                // e.g. https://your-site.netlify.app (set in env)
  'http://localhost:5173',                 // Vite default
  'http://localhost:3000',                 // CRA or other local dev
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. cURL, mobile) which have no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

/**
 * Global rate limit (lightweight)
 * - Avoid brute force and DoS on public endpoints
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.GLOBAL_RATE_LIMIT) || 300, // default 300 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

/**
 * Mount API routes
 * Keep routes organized and mounted before error handlers
 */
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/products', productRoutes);

// simple health endpoint
app.get('/api/health', (req, res) => res.json({ ok: true, now: Date.now() }));

/**
 * 404 + Error handlers (must be registered after routes)
 */
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;

/**
 * Start the server:
 * 1) connect to DB
 * 2) verify (non-blocking) SMTP transporter (logs warning if not ok)
 * 3) listen on PORT
 */
async function start() {
  try {
    // 1) Connect DB
    await connectDB();

    // 2) Verify SMTP transporter (non-blocking)
    try {
      const smtpOk = await verifyTransporter();
      if (!smtpOk) {
        console.warn('Warning: SMTP verify failed. OTP/email may not send.');
      }
    } catch (err) {
      console.warn('SMTP verify threw:', err && err.message ? err.message : err);
    }

    // 3) Start server
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (env=${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

/**
 * Graceful shutdown helpers: close server and DB on signals
 */
function shutdown(signal) {
  return async () => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    try {
      if (server) {
        server.close(() => {
          console.log('HTTP server closed.');
        });
      }
      // If mongoose is used, close connection
      try {
        // dynamic import to avoid circular dependency in some setups
        const mongoose = await import('mongoose');
        if (mongoose?.connection?.readyState) {
          await mongoose.connection.close(false);
          console.log('MongoDB connection closed.');
        }
      } catch (err) {
        console.warn('Error closing MongoDB connection:', err && err.message ? err.message : err);
      }

      // give a short delay for graceful close
      setTimeout(() => process.exit(0), 500);
    } catch (err) {
      console.error('Error during shutdown:', err && err.message ? err.message : err);
      process.exit(1);
    }
  };
}

process.on('SIGINT', shutdown('SIGINT'));
process.on('SIGTERM', shutdown('SIGTERM'));

// Start the app
start();
