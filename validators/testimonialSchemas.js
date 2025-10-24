// validators/testimonialSchemas.js
import Joi from 'joi';

export const createTestimonialSchema = Joi.object({
  text: Joi.string().trim().min(10).required(),
  tag: Joi.string().trim().optional(),
  rating: Joi.number().integer().min(1).max(5).optional(), 
});
