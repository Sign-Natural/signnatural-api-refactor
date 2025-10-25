// models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // receiver
  audience: { type: String, enum: ['user','admin','all'], default: 'user' }, // simple targeting
  type: { type: String, trim: true }, // e.g., 'story_approved', 'booking_status', 'new_booking'
  message: { type: String, required: true },
  link: { type: String }, // optional client route to open
  read: { type: Boolean, default: false },
  meta: { type: Object }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
