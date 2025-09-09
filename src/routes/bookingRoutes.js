import express from 'express';
import {
  createBooking, getMyBookings, getAllBookings, updateBookingStatus
} from '../controllers/bookingConroller.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/me', protect, getMyBookings);

// admin
router.get('/', protect, requireAdmin, getAllBookings);
router.put('/:id/status', protect, requireAdmin, updateBookingStatus);

export default router;
