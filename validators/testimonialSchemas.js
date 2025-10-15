// validators/testimonialSchemas.js
import Joi from 'joi';

export const createTestimonialSchema = Joi.object({
  text: Joi.string().trim().min(10).required(),
  tag: Joi.string().trim().optional(),
  // image will be multipart; keep here for metadata only
});
