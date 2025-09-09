import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  image: String,
  relatedWorkshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' },
  metadata: { type: Object }
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);
