const nodemailer = require("nodemailer");
const { env } = require("../config/env");
const logger = require("../utils/logger");

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  });
  return transporter;
}
async function sendRawMail({ to, subject, text, html }) {
  if (!env.smtpHost) {
    logger.info(`[email:dev] ${subject} -> ${to}`);
    return { accepted: [to], dev: true };
  }
  return getTransporter().sendMail({ from: env.emailFrom, to, subject, text, html });
}
async function sendOtpEmail(email, code) {
  const { queueEmail } = require("./emailTemplates.service");
  return queueEmail({ template:"otp", recipient:email, event:"otp", eventKey:`otp:${email}:${code}`, data:{ code, ttlMinutes:env.otpTtlMinutes } });
}
async function sendTransactionalEmail(template, recipient, data, eventKey) {
  const { queueEmail } = require("./emailTemplates.service");
  return queueEmail({ template, recipient, data, event:template, eventKey });
}
module.exports = { sendRawMail, sendOtpEmail, sendTransactionalEmail };
