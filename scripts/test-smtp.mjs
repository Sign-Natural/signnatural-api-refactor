// backend/scripts/test-smtp.mjs
import dotenv from 'dotenv';
dotenv.config();
import { verifyTransporter, sendOtpEmail } from '../src/utils/email.js';

(async () => {
  console.log('ENV SMTP_HOST=', process.env.SMTP_HOST);
  console.log('ENV SMTP_USER=', !!process.env.SMTP_USER);
  const ok = await verifyTransporter();
  console.log('verifyTransporter =>', ok);

  if (!ok) {
    console.error('SMTP verify failed. Fix SMTP vars in .env and retry.');
    process.exit(1);
  }

  // choose recipient: TEST_EMAIL (dev), fallback to SMTP_USER, fallback to parse SMTP_FROM
  const recipient =
    process.env.TEST_EMAIL ||
    process.env.SMTP_USER ||
    (process.env.SMTP_FROM && process.env.SMTP_FROM.match(/<([^>]+)>/)?.[1]);

  if (!recipient) {
    console.error('No recipient found. Set TEST_EMAIL or SMTP_USER or SMTP_FROM in .env');
    process.exit(1);
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const info = await sendOtpEmail(recipient, otp, 'Test User');
    console.log('Sent test OTP. messageId:', info && info.messageId);
  } catch (err) {
    console.error('Send failed:', err && err.message ? err.message : err);
  }
  process.exit(0);
})();
