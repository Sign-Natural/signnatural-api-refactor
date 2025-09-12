// src/routes/bookingRoutes.js
import express from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus
} from '../controllers/bookingConroller.js'; // fixed import

import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { createBookingSchema } from '../validators/bookingSchemas.js';

const router = express.Router();

// Create a booking (user)
router.post('/', protect, validate(createBookingSchema), createBooking);

// User's bookings
router.get('/me', protect, getMyBookings);

// Admin routes
router.get('/', protect, requireAdmin, getAllBookings);

// Update booking status (admin). If you want validation for status, add a schema.
router.put('/:id/status', protect, requireAdmin, updateBookingStatus);

export default router;
