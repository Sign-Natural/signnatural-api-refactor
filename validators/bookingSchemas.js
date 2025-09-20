// src/validators/bookingSchemas.js
import Joi from 'joi';

export const createBookingSchema = Joi.object({
  itemType: Joi.string().valid('Course','Workshop','Product').required(),
  itemId: Joi.string().required(),
  price: Joi.number().min(0).optional(),
  scheduledAt: Joi.date().iso().optional(),
});

export const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('pending','confirmed','cancelled','completed').required(),
});
