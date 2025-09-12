// src/middlewares/authMiddleware.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  const token = String(authHeader).split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});

// middleware to allow only admin users
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Admin role required');
  }
  next();
};
