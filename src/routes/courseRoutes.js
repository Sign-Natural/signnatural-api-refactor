// src/routes/courseRoutes.js
import express from 'express';
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';

import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { createCourseSchema, updateCourseSchema } from '../validators/courseSchemas.js';
import { upload } from '../middlewares/uploads.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourse);

// Admin-only operations with validation. upload.single BEFORE validate.
router.post('/', protect, requireAdmin, upload.single('image'), validate(createCourseSchema), createCourse);
router.put('/:id', protect, requireAdmin, upload.single('image'), validate(updateCourseSchema), updateCourse);
router.delete('/:id', protect, requireAdmin, deleteCourse);

export default router;
