// backend/src/controllers/authController.js
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Otp from '../models/otp.js';
import generateToken from '../utils/generateToken.js';
import { sendOtpEmail } from '../utils/email.js';

const OTP_EXPIRES_MIN = Number(process.env.OTP_EXPIRES_MINUTES) || 10;

// Helper: create OTP, save hashed, send email
async function createAndSendOtp(user) {
  // generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);

  // remove old OTPs for this user & purpose
  await Otp.deleteMany({ user: user._id, purpose: 'email_verification' });

  await Otp.create({
    user: user._id,
    codeHash: hash,
    purpose: 'email_verification',
    expiresAt
  });

  // send email (async)
  await sendOtpEmail(user.email, otp, user.name);
}

// POST /api/auth/register
// Public: create user (role=user) and send OTP
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('name, email and password are required');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
    emailVerified: false
  });

  // create OTP and send email
  await createAndSendOtp(user);

  res.status(201).json({
    message: 'User registered. OTP sent to email. Verify email to finish signup.'
  });
});

// POST /api/auth/verify-email
// Body: { email, otp }
// Returns JWT + user after successful verification
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error('email and otp required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error('Invalid email');
  }

  const otpDoc = await Otp.findOne({ user: user._id, purpose: 'email_verification' });
  if (!otpDoc) {
    res.status(400);
    throw new Error('No OTP found or it expired. Request a new one.');
  }

  const isMatch = await bcrypt.compare(otp, otpDoc.codeHash);
  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // mark verified
  user.emailVerified = true;
  await user.save();

  // remove used OTPs
  await Otp.deleteMany({ user: user._id, purpose: 'email_verification' });

  // return token + user
  const token = generateToken(user._id, user.role);
  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: true
    }
  });
});

// POST /api/auth/resend-otp
// Body: { email }
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('email required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error('Invalid email');
  }

  if (user.emailVerified) {
    res.status(400);
    throw new Error('Email already verified');
  }

  await createAndSendOtp(user);
  res.json({ message: 'OTP resent to email.' });
});

// POST /api/auth/login
// Only allow login after emailVerified === true
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('email and password required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.emailVerified) {
    res.status(403);
    throw new Error('Email not verified. Check your email for the OTP or request a new one.');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id, user.role);
  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified }
  });
});

export { registerUser, verifyEmail, resendOtp, loginUser };
