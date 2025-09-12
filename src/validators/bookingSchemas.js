// src/validators/bookingSchemas.js
import Joi from 'joi';

export const createBookingSchema = Joi.object({
  itemType: Joi.string().valid('course','workshop','product').required(),
  itemId: Joi.string().required(),
  price: Joi.number().min(0).optional(),
  scheduledAt: Joi.date().iso().optional(),
});
