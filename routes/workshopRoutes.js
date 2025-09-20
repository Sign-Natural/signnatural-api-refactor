// src/routes/workshopRoutes.js
import express from 'express';
import {
  createWorkshop,
  getWorkshops,
  getWorkshop,
  updateWorkshop,
  deleteWorkshop,
} from '../controllers/workshopController.js';

import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { createWorkshopSchema, updateWorkshopSchema } from '../validators/workshopSchemas.js';
import { upload } from '../middlewares/uploads.js';

const router = express.Router();

router.get('/', getWorkshops);
router.get('/:id', getWorkshop);

// Admin-only: create/update/delete with validation. upload before validate
router.post('/', protect, requireAdmin, upload.single('image'), validate(createWorkshopSchema), createWorkshop);
router.put('/:id', protect, requireAdmin, upload.single('image'), validate(updateWorkshopSchema), updateWorkshop);
router.delete('/:id', protect, requireAdmin, deleteWorkshop);

export default router;
