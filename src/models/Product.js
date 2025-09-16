// src/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  image: { type: String, default: null },           // secure url
  imagePublicId: { type: String, default: null },   // cloudinary public_id
  relatedWorkshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' },
  metadata: { type: Object }
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);
