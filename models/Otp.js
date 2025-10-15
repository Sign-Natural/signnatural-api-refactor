// models/Otp.js
import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  codeHash: { type: String, required: true }, // hashed OTP
  purpose: { type: String, enum: ['email_verification', 'password_reset'], default: 'email_verification' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// TTL index: document will be removed by Mongo when expiresAt passes
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Otp', OtpSchema);
