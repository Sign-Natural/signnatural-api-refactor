//routes/testimonialRoutes.js
import express from 'express';
import {
  createTestimonial,
  getApprovedTestimonials,
  getPendingTestimonials,
  approveTestimonial,
  deleteTestimonial,
  getMyTestimonials
} from '../controllers/testimonialController.js';

import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploads.js';
import validate from '../middlewares/validate.js';
import { createTestimonialSchema } from '../validators/testimonialSchemas.js';

const router = express.Router();

// Public: read approved testimonials
router.get('/approved', getApprovedTestimonials);

// Protected: create testimonial (user)
router.post('/', protect, upload.single('image'), validate(createTestimonialSchema), createTestimonial);
router.get('/me', protect, getMyTestimonials);     // <-- add this route

// Admin: pending list, approve, delete
router.get('/pending', protect, requireAdmin, getPendingTestimonials);
router.post('/:id/approve', protect, requireAdmin, approveTestimonial);
router.delete('/:id', protect, requireAdmin, deleteTestimonial);

export default router;
