// models/Testimonial.js
import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  imageUrl: { type: String },       // secure url from cloudinary
  imagePublicId: { type: String },  // cloudinary public_id for deletion
  approved: { type: Boolean, default: false },
  tag: { type: String },
   rating: { type: Number, min: 1, max: 5, default: 5 }, // NEW
}, { timestamps: true });

export default mongoose.model('Testimonial', TestimonialSchema);
