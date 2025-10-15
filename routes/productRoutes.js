// routes/productRoutes.js
import express from 'express';
import { createProduct, getProducts } from '../controllers/productController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { createProductSchema } from '../validators/productSchemas.js';
import { upload } from '../middlewares/uploads.js';

const router = express.Router();

router.get('/', getProducts);

// Admin-only create with optional image
router.post('/', protect, requireAdmin, upload.single('image'), validate(createProductSchema), createProduct);

export default router;
