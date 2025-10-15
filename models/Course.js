// models/Course.js
import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['free', 'online', 'in-person', 'in-demand'], default: 'free' },
  image: { type: String, default: null },            // secure url (Cloudinary or other)
  imagePublicId: { type: String, default: null },    // cloudinary public_id for deletion
  price: { type: Number, default: 0 },
  duration: String,
  location: String,
  category: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published: { type: Boolean, default: true },
  meta: { type: Object }
}, { timestamps: true });

export default mongoose.model('Course', CourseSchema);
