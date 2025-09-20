// src/validators/workshopSchemas.js
import Joi from 'joi';

export const createWorkshopSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().allow('', null),
  type: Joi.string().valid('celebration','diasporan','group','other').default('group'),
  image: Joi.string().uri().allow('', null),
  price: Joi.number().min(0).default(0),
  duration: Joi.string().allow('', null),
  location: Joi.string().allow('', null),
  participants: Joi.string().allow('', null),
});

export const updateWorkshopSchema = createWorkshopSchema.min(1);
