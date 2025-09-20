
import mongoose from 'mongoose';

const WorkshopSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['celebration', 'diasporan', 'group', 'other'], default: 'group' },
  image: { type: String, default: null },           // secure url
  imagePublicId: { type: String, default: null },   // cloudinary public_id
  price: { type: Number, default: 0 },
  duration: String,
  location: String,
  participants: String,
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Workshop', WorkshopSchema);
