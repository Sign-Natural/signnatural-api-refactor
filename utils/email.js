// utils/email.js
import nodemailer from 'nodemailer';

let transporter = null;

function createTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = String(process.env.SMTP_SECURE) === 'true'; // true usually for 465
  const auth = process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
    // Make SMTP more robust in production:
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 15000, // 15s
    greetingTimeout: 10000,   // 10s
    socketTimeout: 20000,     // 20s
    tls: {
      // STARTTLS; modern ciphers
      ciphers: 'TLSv1.2',
      // If your provider uses strict certs, leave rejectUnauthorized true (default).
      // rejectUnauthorized: true,
    },
  });

  console.log('SMTP createTransporter ->', {
    host,
    port,
    secure,
    hasAuth: !!auth,
  });

  return transporter;
}

export async function verifyTransporter() {
  try {
    const t = createTransporter();
    await t.verify();
    console.log('SMTP transporter verified');
    return true;
  } catch (err) {
    console.error('SMTP verify failed:', err?.message || err);
    return false; // do not throw — we don’t want to block server start
  }
}

export async function sendMail({ to, subject, text, html, from = process.env.SMTP_FROM }) {
  if (!to) throw new Error('sendMail: "to" is required');
  const t = createTransporter();
  return t.sendMail({ from, to, subject, text, html });
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
