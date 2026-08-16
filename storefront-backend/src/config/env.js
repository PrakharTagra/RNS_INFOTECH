const { loadEnvironment } = require("./loadEnv");
const appEnv = loadEnvironment();
const required = ["MONGO_URI","CORS_ORIGIN","JWT_ACCESS_SECRET","JWT_REFRESH_SECRET","JWT_ACCESS_TTL","JWT_REFRESH_TTL","OTP_TTL_MINUTES","OTP_RESEND_COOLDOWN_SECONDS","OTP_MAX_ATTEMPTS","OTP_DEBUG_ECHO","PORT","SMTP_PORT","EMAIL_FROM"];
const requiredInProduction = ["MONGO_URI","JWT_ACCESS_SECRET","JWT_REFRESH_SECRET","RAZORPAY_KEY_ID","RAZORPAY_KEY_SECRET","RAZORPAY_WEBHOOK_SECRET","SMTP_HOST","EMAIL_FROM"];
const corsOrigin = (process.env.CORS_ORIGIN || "").split(",").map((x) => x.trim()).filter(Boolean);
const env = {
  appEnv, exposeErrorStacks: process.env.EXPOSE_ERROR_STACKS === "true", nodeEnv: process.env.NODE_ENV || (appEnv === "production" || appEnv === "staging" ? "production" : appEnv),
  port: Number(process.env.PORT), mongoUri: process.env.MONGO_URI, corsOrigin,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET, jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessTtl: process.env.JWT_ACCESS_TTL, jwtRefreshTtl: process.env.JWT_REFRESH_TTL,
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES), otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS), otpDebugEcho: process.env.OTP_DEBUG_ECHO === "true",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "", razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  emailMaxAttempts: Math.max(1, Number(process.env.EMAIL_MAX_ATTEMPTS || 5)),
  emailRetryIntervalSeconds: Math.max(10, Number(process.env.EMAIL_RETRY_INTERVAL_SECONDS || 30)), razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  smtpHost: process.env.SMTP_HOST || "", smtpPort: Number(process.env.SMTP_PORT), smtpUser: process.env.SMTP_USER || "", smtpPass: process.env.SMTP_PASS || "", emailFrom: process.env.EMAIL_FROM,
  returnWindowDays: Math.max(1, Number(process.env.RETURN_WINDOW_DAYS || 7)),
  paymentReconcileSeconds: Math.max(30, Number(process.env.PAYMENT_RECONCILE_SECONDS || 120)),
  rateLimitInTests: process.env.RATE_LIMIT_IN_TESTS === "true",
  generalRateLimit: Math.max(30, Number(process.env.GENERAL_RATE_LIMIT || 180)),
  generalRateWindowMs: Math.max(10_000, Number(process.env.GENERAL_RATE_LIMIT_WINDOW_SECONDS || 60) * 1000),
  authRateLimit: Math.max(3, Number(process.env.AUTH_RATE_LIMIT || 20)),
  authRateWindowMs: Math.max(10_000, Number(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000),
  otpRateLimit: Math.max(1, Number(process.env.OTP_RATE_LIMIT || 5)),
  otpRateWindowMs: Math.max(10_000, Number(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000),
  paymentRateLimit: Math.max(5, Number(process.env.PAYMENT_RATE_LIMIT || 30)),
  paymentRateWindowMs: Math.max(10_000, Number(process.env.PAYMENT_RATE_LIMIT_WINDOW_MINUTES || 1) * 60 * 1000),
  sensitiveRateLimit: Math.max(5, Number(process.env.SENSITIVE_RATE_LIMIT || 30)),
  sensitiveRateWindowMs: Math.max(10_000, Number(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MINUTES || 1) * 60 * 1000),
  paymentTimeoutMinutes: Math.max(1, Number(process.env.PAYMENT_TIMEOUT_MINUTES || 15)),
  emailMaxAttempts: Math.max(1, Number(process.env.EMAIL_MAX_ATTEMPTS || 5)),
  emailRetryIntervalSeconds: Math.max(10, Number(process.env.EMAIL_RETRY_INTERVAL_SECONDS || 30)),
};
function assertEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  if (!env.port || env.port < 1 || env.port > 65535) throw new Error("PORT must be a valid TCP port.");
  if (!env.corsOrigin.length) throw new Error("CORS_ORIGIN must contain at least one allowed origin.");
  if (!Number.isFinite(env.otpTtlMinutes) || env.otpTtlMinutes <= 0) throw new Error("OTP_TTL_MINUTES must be greater than 0.");
  if (!Number.isFinite(env.otpResendCooldownSeconds) || env.otpResendCooldownSeconds < 0) throw new Error("OTP_RESEND_COOLDOWN_SECONDS must be 0 or greater.");
  if (!Number.isFinite(env.otpMaxAttempts) || env.otpMaxAttempts < 1) throw new Error("OTP_MAX_ATTEMPTS must be at least 1.");
  if (!Number.isFinite(env.smtpPort) || env.smtpPort < 1 || env.smtpPort > 65535) throw new Error("SMTP_PORT must be a valid TCP port.");
  if (env.nodeEnv === "production") {
    const missingProd = requiredInProduction.filter((k) => !process.env[k]);
    if (missingProd.length) throw new Error(`Missing required production environment variables: ${missingProd.join(", ")}`);
    if (env.otpDebugEcho) throw new Error("OTP_DEBUG_ECHO must be false in production.");
  }
}
module.exports = { env, assertEnv };
