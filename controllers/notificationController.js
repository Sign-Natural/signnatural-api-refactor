// controllers/notificationController.js
import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';


// GET /api/notifications (current user, unread first)
export const getMyNotifications = asyncHandler(async (req, res) => {
  const list = await Notification.find({
    $or: [{ user: req.user._id }, { audience: 'all' }, { audience: req.user.role === 'admin' ? 'admin' : '__none__' }]
  })
  .sort({ read: 1, createdAt: -1 })
  .limit(100);

  res.json(list);
});

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, $or: [{ user: req.user._id }, { audience: 'all' }] });
  if (!n) {
    res.status(404);
    throw new Error('Notification not found');
  }
  n.read = true;
  await n.save();
  res.json({ ok: true });
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { $or: [{ user: req.user._id }, { audience: 'all' }, { audience: req.user.role === 'admin' ? 'admin' : '__none__' }] },
    { $set: { read: true } }
  );
  res.json({ ok: true });
});
