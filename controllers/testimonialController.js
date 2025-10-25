//controllers/testimonialController.js

import asyncHandler from 'express-async-handler';
import Testimonial from '../models/Testimonial.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import Notification from '../models/Notification.js';

/**
 * POST /api/testimonials
 * Protected (user) - create testimonial (image optional)
 */
export const createTestimonial = asyncHandler(async (req, res) => {
  const { text, tag } = req.body;
  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error('Text is required');
  }

  let imageUrl = null;
  let imagePublicId = null;

  if (req.file && req.file.buffer) {
    // pass options object — folder + transformations
    const options = { folder: 'signnatural/testimonials', transformation: [{ width: 1200, crop: 'limit' }] };
    const result = await uploadBufferToCloudinary(req.file.buffer, options);
    imageUrl = result.secure_url;
    imagePublicId = result.public_id;
  }

  const doc = await Testimonial.create({
    user: req.user ? req.user._id : null,
    text: text.trim(),
    tag: tag || null,
    imageUrl,
    imagePublicId,
    rating:rating ? Number(rating): undefined,
    approved: false, // admin must approve
  });

  res.status(201).json(doc);
});



/**
 * GET /api/testimonials/approved
 * Public - list approved testimonials
 */
export const getApprovedTestimonials = asyncHandler(async (req, res) => {
  const docs = await Testimonial
    .find({ approved: true })
    .populate('user', 'name') // NEW: bring the name along
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(docs);
});

/**
 * GET /api/testimonials/pending
 * Admin - list pending testimonials
 */
export const getPendingTestimonials = asyncHandler(async (req, res) => {
  const docs = await Testimonial.find({ approved: false }).sort({ createdAt: -1 });
  res.json(docs);
});

/**
 * POST /api/testimonials/:id/approve
 * Admin - approve a testimonial
 */
export const approveTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await Testimonial.findById(id);
  if (!doc) {
    res.status(404);
    throw new Error('Testimonial not found');
  }
  doc.approved = true;
  await doc.save();
  await Notification.create({
  user: doc.user,               // receiver
  audience: 'user',
  type: 'story_approved',
  message: 'Your story has been approved and is now visible on Success Stories.',
  link: '/stories',             // front-end route
  meta: { testimonialId: doc._id }
});
  res.json(doc);
  
});


/**
 * DELETE /api/testimonials/:id
 * Admin - delete testimonial and remove cloudinary asset if present
 */
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doc = await Testimonial.findById(id);
  if (!doc) {
    res.status(404);
    throw new Error('Testimonial not found');
  }

  if (doc.imagePublicId) {
    try {
      await deleteFromCloudinary(doc.imagePublicId);
    } catch (err) {
      // Log but continue deletion in DB
      console.error('Cloudinary delete failed:', err.message || err);
    }
  }

  await doc.remove();
  res.json({ message: 'Testimonial deleted' });
});

// GET /api/testimonials/me  (Protected)
export const getMyTestimonials = asyncHandler(async (req, res) => {
  const docs = await Testimonial.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.json(docs);
});
