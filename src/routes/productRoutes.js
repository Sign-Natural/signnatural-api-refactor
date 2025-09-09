import express from 'express';
import { createProduct, getProducts } from '../controllers/productController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', protect, requireAdmin, createProduct);

export default router;
