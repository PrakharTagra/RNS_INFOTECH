const nodemailer = require("nodemailer");
const dns = require("dns").promises;
const { env } = require("../config/env");
const logger = require("../utils/logger");

let transporterPromise = null;
function getTransporter() {
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    // Setting dns.setDefaultResultOrder("ipv4first") wasn't enough — Nodemailer's
    // SMTPConnection doesn't reliably go through Node's global dns.lookup()
    // ordering for this. Resolve the IPv4 address ourselves and connect to
    // that directly, so there's no ambiguity about which address family gets
    // used. We still set tls.servername to the original hostname so
    // certificate validation checks against smtp.gmail.com, not the raw IP.
    let connectHost = env.smtpHost;
    try {
      const { address } = await dns.lookup(env.smtpHost, { family: 4 });
      connectHost = address;
    } catch (err) {
      logger.warn(`[email] IPv4 lookup for ${env.smtpHost} failed, falling back to hostname: ${err.message}`);
    }
    return nodemailer.createTransport({
      host: connectHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
      // Nodemailer's defaults let a blocked/black-holed outbound connection
      // hang for up to 2 minutes before failing, which just makes diagnosing
      // provider-level port blocking (common on free PaaS tiers) painfully
      // slow. Fail fast instead so a stuck connection surfaces as a clear
      // error within seconds, not minutes.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
      tls: { servername: env.smtpHost },
    });
  })();
  return transporterPromise;
}
async function sendRawMail({ to, subject, text, html }) {
  if (!env.smtpHost) {
    logger.info(`[email:dev] ${subject} -> ${to}`);
    return { accepted: [to], dev: true };
  }
  const transporter = await getTransporter();
  return transporter.sendMail({ from: env.emailFrom, to, subject, text, html });
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