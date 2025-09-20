// src/routes/bookingRoutes.js
import express from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus
} from '../controllers/bookingConroller.js';

import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { createBookingSchema, updateBookingStatusSchema} from '../validators/bookingSchemas.js';

const router = express.Router();

// Create a booking (user)
router.post('/', protect, validate(createBookingSchema), createBooking);

// User's bookings
router.get('/me', protect, getMyBookings);

// Admin routes
router.get('/', protect, requireAdmin, getAllBookings);

router.put('/:id/status', protect, requireAdmin, validate(updateBookingStatusSchema), updateBookingStatus);

export default router;
