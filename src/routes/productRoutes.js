// src/routes/productRoutes.js
import express from 'express';
import { createProduct, getProducts } from '../controllers/productController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { createProductSchema } from '../validators/productSchemas.js';

const router = express.Router();

router.get('/', getProducts);

// Admin-only create
router.post('/', protect, requireAdmin, validate(createProductSchema), createProduct);

export default router;
