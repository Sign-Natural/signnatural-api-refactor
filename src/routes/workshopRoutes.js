import express from 'express';
import {
  createWorkshop, getWorkshops, getWorkshop, updateWorkshop, deleteWorkshop
} from '../controllers/workshopController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getWorkshops);
router.get('/:id', getWorkshop);

router.post('/', protect, requireAdmin, createWorkshop);
router.put('/:id', protect, requireAdmin, updateWorkshop);
router.delete('/:id', protect, requireAdmin, deleteWorkshop);

export default router;
