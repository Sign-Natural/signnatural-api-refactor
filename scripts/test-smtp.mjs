// smtp-test.js
import nodemailer from "nodemailer";

async function testSMTP() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = String(process.env.SMTP_SECURE) === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log("Testing Gmail SMTP connection...\n");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { ciphers: "TLSv1.2" },
    logger: true,
    debug: true,
  });

  try {
    // Verify connection configuration
    const success = await transporter.verify();
    console.log("\n✅ SMTP Verified successfully!");
    console.log(`Server: ${host}:${port} (secure=${secure})`);
    console.log(`User: ${user}`);
    return success;
  } catch (err) {
    console.error("\n❌ SMTP Verification failed!");
    console.error(err.message || err);
  }

  // Optional: send a test email
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Sign Natural" <${user}>`,
      to: user, // send to yourself
      subject: "SMTP Test from Sign Natural Backend",
      text: "This is a test email sent from your Node.js backend using Gmail SMTP.",
    });
    console.log("✅ Test email sent!");
    console.log(info);
  } catch (err) {
    console.error("❌ Failed to send test email:");
    console.error(err.message || err);
  }
}

testSMTP();
