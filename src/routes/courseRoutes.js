import express from 'express';
import {
  createCourse, getCourses, getCourse, updateCourse, deleteCourse
} from '../controllers/courseController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourse);

router.post('/', protect, requireAdmin, createCourse);
router.put('/:id', protect, requireAdmin, updateCourse);
router.delete('/:id', protect, requireAdmin, deleteCourse);

export default router;
