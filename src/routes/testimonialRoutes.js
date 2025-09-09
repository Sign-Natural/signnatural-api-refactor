import express from 'express';
import { createTestimonial, getApproved, getPending, approveTestimonial } from '../controllers/testimonialController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploads.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), createTestimonial);
router.get('/approved', getApproved);

// admin
router.get('/pending', protect, requireAdmin, getPending);
router.post('/:id/approve', protect, requireAdmin, approveTestimonial);

export default router;
