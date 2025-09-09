import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

const createProduct = asyncHandler(async (req, res) => {
  const data = req.body;
  const p = await Product.create(data);
  res.status(201).json(p);
});

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

export { createProduct, getProducts };
