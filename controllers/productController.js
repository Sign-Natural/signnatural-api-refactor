//controllers/productController.js

import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const createProduct = asyncHandler(async (req, res) => {
  const data = req.body || {};
  let image = data.image || null;
  let imagePublicId = data.imagePublicId || null;

  if (req.file && req.file.buffer) {
    try {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'signnatural/products',
        transformation: [{ width: 1600, crop: 'limit' }],
      });
      image = result.secure_url;
      imagePublicId = result.public_id;
    } catch (err) {
      console.error('Cloudinary upload failed (createProduct):', err.message || err);
    }
  }

  const p = await Product.create({ ...data, image, imagePublicId });
  res.status(201).json(p);
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

export { createProduct, getProducts };
