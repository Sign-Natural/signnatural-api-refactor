// validators/authSchemas.js
import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(6).required(),
});

export const verifyEmailSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required(),
  otp: Joi.string().pattern(/^\d{6}$/).required(), // 6-digit numeric OTP
});

export const resendOtpSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required(),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().required(),
});

export const createAdminSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(8).required(),
});

export const googleLoginSchema = Joi.object({
  credential: Joi.string().required(), // the JWT from Google Identity Services
});