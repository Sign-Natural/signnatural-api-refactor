import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  image: String,
  approved: { type: Boolean, default: false },
  tag: String
}, { timestamps: true });

export default mongoose.model('Testimonial', TestimonialSchema);
