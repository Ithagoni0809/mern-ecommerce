/**
 * @file server/utils/sendEmail.js
 * SMTP Transporter for Email Verification & Password Reset
 */
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || "mock_user",
      pass: process.env.SMTP_PASS || "mock_pass",
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || "BharatKart Platform"} <${process.env.FROM_EMAIL || "noreply@bharatkart.com"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log(`[Email Service] Message sent: %s`, info.messageId);
};

module.exports = sendEmail;
