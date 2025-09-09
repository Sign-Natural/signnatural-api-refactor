import asyncHandler from 'express-async-handler';
import Workshop from '../models/Workshop.js';

const createWorkshop = asyncHandler(async (req, res) => {
  const data = req.body;
  const ws = await Workshop.create({ ...data, host: req.user._id });
  res.status(201).json(ws);
});

const getWorkshops = asyncHandler(async (req, res) => {
  const { q, type, location, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (location) filter.location = location;
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
  const ws = await Workshop.find(filter).skip((page - 1) * limit).limit(parseInt(limit));
  res.json(ws);
});

const getWorkshop = asyncHandler(async (req, res) => {
  const ws = await Workshop.findById(req.params.id);
  if (!ws) { res.status(404); throw new Error('Workshop not found'); }
  res.json(ws);
});

const updateWorkshop = asyncHandler(async (req, res) => {
  const ws = await Workshop.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(ws);
});

const deleteWorkshop = asyncHandler(async (req, res) => {
  await Workshop.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export { createWorkshop, getWorkshops, getWorkshop, updateWorkshop, deleteWorkshop };
