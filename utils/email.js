// utils/email.js
import nodemailer from 'nodemailer';

let transporter = null;

function createTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || '';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = String(process.env.SMTP_SECURE) === 'true'; // true for 465
  const auth = process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass:process.env.SMTP_PASS }
    : undefined;

  transporter = nodemailer.createTransport({ host, port, secure, auth });

  // Optional: log resolved settings for debugging
  console.log('SMTP createTransporter ->', { host, port, secure, hasAuth: !!auth });
  return transporter;
}

export async function verifyTransporter() {
  const t = createTransporter();
  try {
    await t.verify();
    console.log('SMTP transporter verified');
    return true;
  } catch (err) {
    console.error('SMTP verify failed:', err && err.message ? err.message : err);
    return false;
  }
}

export async function sendMail({ to, subject, text, html, from = process.env.SMTP_FROM }) {
  if (!to) throw new Error('sendMail: "to" is required');
  const t = createTransporter();
  const info = await t.sendMail({ from, to, subject, text, html });
  return info;
}

export async function sendOtpEmail(to, otp, name = '') {
  if (!to) throw new Error('sendOtpEmail: "to" is required');
  const expires = process.env.OTP_EXPIRES_MINUTES || 10;
  const from = process.env.SMTP_FROM || 'Sign Natural <no-reply@signnatural.com>';
  const subject = 'Verify your email — Sign Natural Academy';
  const text = `Hi ${name || 'there'},\n\nYour verification code is ${otp} (expires in ${expires} minutes).\n\n— Sign Natural`;
  const html = `
    <div style="font-family: Arial, sans-serif; color:#222;">
      <p>Hi ${name || 'there'},</p>
      <p>Your Sign Natural verification code is:</p>
      <h2 style="letter-spacing:4px">${otp}</h2>
      <p>This code expires in ${expires} minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr/>
      <small>Sign Natural Academy</small>
    </div>
  `;
  return sendMail({ to, subject, text, html, from });
}

export default { createTransporter, verifyTransporter, sendMail, sendOtpEmail };
