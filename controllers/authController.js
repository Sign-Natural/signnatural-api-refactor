//controllers/authController.js
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import Otp from '../models/Otp.js';
import generateToken from '../utils/generateToken.js';
import { sendOtpEmail } from '../utils/email.js';
import User from '../models/User.js';

const OTP_EXPIRES_MIN = Number(process.env.OTP_EXPIRES_MINUTES) || 10;

async function createAndSendOtp(user) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);

  await Otp.deleteMany({ user: user._id, purpose: 'email_verification' });

  await Otp.create({
    user: user._id,
    codeHash: hash,
    purpose: 'email_verification',
    expiresAt
  });

  await sendOtpEmail(user.email, otp, user.name);
}

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

try {
  await createAndSendOtp(user);
  res.status(201).json({ message: 'User registered. OTP sent to email.' });
} catch (e) {
  console.error('OTP email send failed after registration:', e?.message || e);
  // user is created & OTP saved in DB;
  // they can use /api/auth/resend-otp once SMTP is ok
  res.status(201).json({ message: 'User registered. OTP could not be sent right now—use "Resend code".' });
}
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error('email and otp required');
  }

  const user = await User.findOne({ email });
  if (!user) { res.status(400); throw new Error('Invalid email'); }

  const otpDoc = await Otp.findOne({ user: user._id, purpose: 'email_verification' });
  if (!otpDoc) { res.status(400); throw new Error('No OTP found or it expired'); }

  const isMatch = await bcrypt.compare(otp, otpDoc.codeHash);
  if (!isMatch) { res.status(400); throw new Error('Invalid OTP'); }

  user.emailVerified = true;
  await user.save();

  await Otp.deleteMany({ user: user._id, purpose: 'email_verification' });

  const token = generateToken(user._id, user.role);
  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, emailVerified: true }
  });
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('email required'); }

  const user = await User.findOne({ email });
  if (!user) { res.status(400); throw new Error('Invalid email'); }
  if (user.emailVerified) { res.status(400); throw new Error('Email already verified'); }

  await createAndSendOtp(user);
  res.json({ message: 'OTP resent to email.' });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('email and password required'); }

  const user = await User.findOne({ email });
  if (!user) { res.status(401); throw new Error('Invalid credentials'); }

  if (!user.emailVerified) { res.status(403); throw new Error('Email not verified'); }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) { res.status(401); throw new Error('Invalid credentials'); }

  const token = generateToken(user._id, user.role);
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified } });
});

// Admin only: create an admin user (protected route)
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) { res.status(400); throw new Error('name, email and password required'); }

  const exists = await User.findOne({ email });
  if (exists) { res.status(400); throw new Error('Email already registered'); }

  const admin = await User.create({ name, email, password, role: 'admin', emailVerified: true });
  res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role });
});

const getMe = asyncHandler(async (req, res) => {
  const u = await User.findById(req.user._id).select('-password');
  res.json(u);
});

export { registerUser, verifyEmail, resendOtp, loginUser, createAdmin, getMe };
