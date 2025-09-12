// src/controllers/workshopController.js
import asyncHandler from 'express-async-handler';
import Workshop from '../models/Workshop.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * Reuse same validation approach as courses
 */
function validateImageFile(file) {
  if (!file) return;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    const err = new Error('Only jpg, png or webp images are allowed');
    err.status = 400;
    throw err;
  }
  const MAX = Number(process.env.MAX_IMAGE_SIZE_BYTES) || 5 * 1024 * 1024;
  if (file.size && file.size > MAX) {
    const err = new Error(`Image too large. Max ${Math.round(MAX / 1024 / 1024)} MB`);
    err.status = 400;
    throw err;
  }
}

/**
 * POST /api/workshops
 * Admin only (protect + requireAdmin at route)
 * Accepts multipart/form-data with optional 'image' file
 */
const createWorkshop = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.file && req.file.buffer) {
    validateImageFile(req.file);
    const options = {
      folder: 'signnatural/workshops',
      transformation: [{ width: 1200, crop: 'limit' }],
    };
    const result = await uploadBufferToCloudinary(req.file.buffer, options);
    data.image = result.secure_url;
    data.imagePublicId = result.public_id;
  }

  if (req.user && req.user._id) data.host = req.user._id;

  const ws = await Workshop.create(data);
  res.status(201).json(ws);
});

/**
 * GET /api/workshops
 */
const getWorkshops = asyncHandler(async (req, res) => {
  const { q, type, location, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (location) filter.location = location;
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];

  const ws = await Workshop.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  res.json(ws);
});

/**
 * GET /api/workshops/:id
 */
const getWorkshop = asyncHandler(async (req, res) => {
  const ws = await Workshop.findById(req.params.id);
  if (!ws) {
    res.status(404);
    throw new Error('Workshop not found');
  }
  res.json(ws);
});

/**
 * PUT /api/workshops/:id
 * Admin only
 */
const updateWorkshop = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  if (req.file && req.file.buffer) {
    validateImageFile(req.file);

    const existing = await Workshop.findById(req.params.id).select('imagePublicId').lean();
    if (existing && existing.imagePublicId) {
      try {
        await deleteFromCloudinary(existing.imagePublicId);
      } catch (err) {
        console.warn('Cloudinary delete error (workshop update):', err && err.message ? err.message : err);
      }
    }

    const options = {
      folder: 'signnatural/workshops',
      transformation: [{ width: 1200, crop: 'limit' }],
    };
    const result = await uploadBufferToCloudinary(req.file.buffer, options);
    updates.image = result.secure_url;
    updates.imagePublicId = result.public_id;
  }

  const ws = await Workshop.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!ws) {
    res.status(404);
    throw new Error('Workshop not found');
  }

  res.json(ws);
});

/**
 * DELETE /api/workshops/:id
 * Admin only
 */
const deleteWorkshop = asyncHandler(async (req, res) => {
  const ws = await Workshop.findById(req.params.id);
  if (!ws) {
    res.status(404);
    throw new Error('Workshop not found');
  }

  if (ws.imagePublicId) {
    try {
      await deleteFromCloudinary(ws.imagePublicId);
    } catch (err) {
      console.warn('Cloudinary delete error (workshop delete):', err && err.message ? err.message : err);
    }
  }

  await ws.remove();
  res.json({ ok: true, message: 'Workshop deleted' });
});

export { createWorkshop, getWorkshops, getWorkshop, updateWorkshop, deleteWorkshop };
