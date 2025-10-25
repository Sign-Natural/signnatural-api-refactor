//controllers/bookingController.js

import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

const createBooking = asyncHandler(async (req, res) => {
  const { itemType, itemId, price, scheduledAt } = req.body;
  if (!itemType || !itemId) { res.status(400); throw new Error('itemType and itemId required'); }
  const booking = await Booking.create({
    user: req.user._id,
    itemType,
    item: itemId,
    price,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    status: 'pending',
    payment: { paid: false, amount: price }
  });
  await Notification.create({
  audience: 'admin',
  type: 'new_booking',
  message: `New ${itemType.toLowerCase()} booking created.`,
  link: '/admin-dashboard?tab=bookings',
  meta: { bookingId: booking._id, itemType }
});
  res.status(201).json(booking);

});


const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate('item');
  res.json(bookings);
});

const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().populate('user').populate('item');
  res.json(bookings);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  // defensive read
  const status = req.body?.status;
  if (!status) {
    res.status(400);
    throw new Error('status is required in request body');
  }

  const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Allowed: ${allowed.join(', ')}`);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.status = status;
  await booking.save(); // triggers hooks and returns updated doc
  await Notification.create({
  user: booking.user,
  audience: 'user',
  type: 'booking_status',
  message: `Your booking status is now "${status}".`,
  link: '/user-dashboard?tab=bookings',
  meta: { bookingId: booking._id, status }
});
  res.json(booking);
});

export { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
