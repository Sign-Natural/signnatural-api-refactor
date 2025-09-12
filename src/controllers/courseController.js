// src/controllers/courseController.js
import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * Helper: validate uploaded file (optional extra guard)
 */
function validateImageFile(file) {
  if (!file) return;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    const err = new Error('Only jpg, png or webp images are allowed');
    err.status = 400;
    throw err;
  }
  // extra: size guard (in bytes) — multer limits are preferred
  const MAX = Number(process.env.MAX_IMAGE_SIZE_BYTES) || 5 * 1024 * 1024; // default 5MB
  if (file.size && file.size > MAX) {
    const err = new Error(`Image too large. Max ${Math.round(MAX / 1024 / 1024)} MB`);
    err.status = 400;
    throw err;
  }
}

/**
 * POST /api/courses
 * Admin only (routes should enforce protect + requireAdmin)
 * Accepts multipart/form-data with optional file field 'image'
 */
const createCourse = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  // If multer provided a file in memory
  if (req.file && req.file.buffer) {
    validateImageFile(req.file);
    const options = {
      folder: 'signnatural/courses',
      transformation: [{ width: 1200, crop: 'limit' }],
    };
    const result = await uploadBufferToCloudinary(req.file.buffer, options);
    data.image = result.secure_url;
    data.imagePublicId = result.public_id;
  }

  // If instructor provided by server (req.user), attach
  if (req.user && req.user._id) data.instructor = req.user._id;

  const course = await Course.create(data);
  res.status(201).json(course);
});

/**
 * GET /api/courses
 * Public
 */
const getCourses = asyncHandler(async (req, res) => {
  const { q, type, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];

  const courses = await Course.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10))
    .populate('instructor', '-password -__v');

  res.json(courses);
});

/**
 * GET /api/courses/:id
 */
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', '-password -__v');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json(course);
});

/**
 * PUT /api/courses/:id
 * Admin only
 * Accepts multipart/form-data (image optional)
 */
const updateCourse = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  // handle new image upload (replace existing)
  if (req.file && req.file.buffer) {
    validateImageFile(req.file);

    // fetch existing doc to delete old image if present
    const existing = await Course.findById(req.params.id).select('imagePublicId').lean();
    if (existing && existing.imagePublicId) {
      try {
        await deleteFromCloudinary(existing.imagePublicId);
      } catch (err) {
        // log and continue; do not block update on cloud delete failure
        console.warn('Cloudinary delete error (course update):', err && err.message ? err.message : err);
      }
    }

    const options = {
      folder: 'signnatural/courses',
      transformation: [{ width: 1200, crop: 'limit' }],
    };
    const result = await uploadBufferToCloudinary(req.file.buffer, options);
    updates.image = result.secure_url;
    updates.imagePublicId = result.public_id;
  }

  const course = await Course.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json(course);
});

/**
 * DELETE /api/courses/:id
 * Admin only
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // delete cloudinary asset if present
  if (course.imagePublicId) {
    try {
      await deleteFromCloudinary(course.imagePublicId);
    } catch (err) {
      console.warn('Cloudinary delete error (course delete):', err && err.message ? err.message : err);
    }
  }

  await course.remove();
  res.json({ ok: true, message: 'Course deleted' });
});

export { createCourse, getCourses, getCourse, updateCourse, deleteCourse };
