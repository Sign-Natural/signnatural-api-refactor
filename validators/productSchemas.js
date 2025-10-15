// validators/productSchemas.js
import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0).default(0),
  image: Joi.string().uri().allow('', null),
  relatedWorkshop: Joi.string().optional(),
});
