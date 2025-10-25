// routes/notificationRoutes.js
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getMyNotifications, markRead, markAllRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.patch('/:id/read', protect, markRead);
router.patch('/read-all', protect, markAllRead);

export default router;
