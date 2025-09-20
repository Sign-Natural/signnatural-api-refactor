// src/validators/courseSchemas.js
import Joi from 'joi';

export const createCourseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().max(2000).allow('', null),
  type: Joi.string().valid('free', 'online', 'in-person', 'in-demand').default('free'),
  image: Joi.string().uri({ allowRelative: true }).allow('', null),
  price: Joi.number().min(0).default(0),
  duration: Joi.string().trim().allow('', null),
  category: Joi.string().trim().allow('', null),
  instructor: Joi.string().hex().length(24).optional(), // Mongo ObjectId (if provided)
});

export const updateCourseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  type: Joi.string().valid('free', 'online', 'in-person', 'in-demand').optional(),
  image: Joi.string().uri({ allowRelative: true }).allow('', null).optional(),
  price: Joi.number().min(0).optional(),
  duration: Joi.string().trim().allow('', null).optional(),
  category: Joi.string().trim().allow('', null).optional(),
  instructor: Joi.string().hex().length(24).optional(),
}).min(1); // require at least one field when updating
