//src/controllers/bookingController.js
import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';

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
  const { status } = req.body;
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(booking);
});

export { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
