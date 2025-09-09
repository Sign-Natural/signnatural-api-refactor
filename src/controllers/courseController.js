import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';

const createCourse = asyncHandler(async (req, res) => {
  const data = req.body;
  const course = await Course.create({ ...data, instructor: req.user._id });
  res.status(201).json(course);
});

const getCourses = asyncHandler(async (req, res) => {
  const { q, type, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
  const courses = await Course.find(filter).skip((page - 1) * limit).limit(parseInt(limit));
  res.json(courses);
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  res.json(course);
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export { createCourse, getCourses, getCourse, updateCourse, deleteCourse };
