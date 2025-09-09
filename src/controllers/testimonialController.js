import asyncHandler from 'express-async-handler';
import Testimonial from '../models/Testimonial.js';
import { uploadToCloudinary } from '../middlewares/uploads.js';

const createTestimonial = asyncHandler(async (req, res) => {
  const { text, tag } = req.body;
  let imageUrl = null;
  if (req.file && uploadToCloudinary) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, 'testimonials');
      imageUrl = result?.secure_url || null;
    } catch (err) {
      console.error('Cloudinary upload error', err);
    }
  }
  const t = await Testimonial.create({
    user: req.user._id,
    text,
    tag,
    image: imageUrl,
    approved: false
  });
  res.status(201).json(t);
});

const getApproved = asyncHandler(async (req, res) => {
  const list = await Testimonial.find({ approved: true }).populate('user');
  res.json(list);
});

const getPending = asyncHandler(async (req, res) => {
  const list = await Testimonial.find({ approved: false }).populate('user');
  res.json(list);
});

const approveTestimonial = asyncHandler(async (req, res) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
  res.json(t);
});

export { createTestimonial, getApproved, getPending, approveTestimonial };
