// backend/src/utils/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

// Exportable helper
export async function sendOtpEmail(to, otp, name = '') {
  const from = process.env.SMTP_FROM || 'Sign Natural <no-reply@signnatural.com>';
  const html = `
    <div style="font-family: Arial, sans-serif; color:#222;">
      <p>Hi ${name || 'there'},</p>
      <p>Your Sign Natural verification code is:</p>
      <h2 style="letter-spacing:4px">${otp}</h2>
      <p>This code expires in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr/>
      <small>Sign Natural Academy</small>
    </div>
  `;
  await transporter.sendMail({
    from,
    to,
    subject: 'Verify your email — Sign Natural Academy',
    html
  });
}
