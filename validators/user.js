import Joi from "joi";

export const newUserValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    confirmPassword: Joi.ref('password')

}).with('password', 'confirmPassword')
    .messages({
        'any.required': '{{#label}} is required',
        'string.empty': '{{#label}} cannot be empty',
        'string.email': '{{#label}} must be a valid email address',
        'any.only': '{{#label}} must match password'
    });

export const loginValidator = Joi.object().keys({
    username: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().required(),
});