// routes/notificationStreamRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { addClient } from '../utils/sseHub.js';

const router = express.Router();

/**
 * GET /api/notifications/stream?token=JWT
 * SSE stream. We use a query token because EventSource cannot set custom headers.
 */
router.get('/stream', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).end();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id role');
    if (!user) return res.status(401).end();

    // SSE headers
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // for some proxies
    });
    res.flushHeaders?.();

    // initial ping so browser "opens" the stream
    res.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);

    // register client
    addClient({ res, user });

    // keep-alive ping every 25s
    const interval = setInterval(() => {
      try { res.write(':\n\n'); } catch {}
    }, 25000);

    res.on('close', () => clearInterval(interval));
  } catch (e) {
    res.status(401).end();
  }
});

export default router;
