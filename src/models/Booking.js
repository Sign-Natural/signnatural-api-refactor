//src/models/Booking.js

import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, enum: ['course', 'workshop', 'product'], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemType' },
  price: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  payment: {
    provider: String,
    providerId: String,
    amount: Number,
    currency: String,
    paid: { type: Boolean, default: false }
  },
  scheduledAt: { type: Date },
  meta: { type: Object }
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
