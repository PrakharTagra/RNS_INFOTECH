
const createApp = require("./src/app");
const { connectDB } = require("./src/config/db");
const { env, assertEnv } = require("./src/config/env");
const { attachSocket } = require("./src/socket");
const logger = require("./src/utils/logger");
const { startEmailQueue } = require("./src/services/emailTemplates.service");
const { startReservationSweeper } = require("./src/services/stock.service");
const { startCouponSweeper } = require("./src/services/coupon.service");
const { startPaymentReconciliation } = require("./src/services/paymentReconciliation.service");

async function main() {
  assertEnv();
  await connectDB();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`[storefront-backend] listening on :${env.port} (${env.nodeEnv})`);
  });

  attachSocket(server);
  const emailQueue = startEmailQueue();
  const reservationSweep = await startReservationSweeper();
  const couponSweep = await startCouponSweeper();
  const paymentReconcile = startPaymentReconciliation();

  const shutdown = (signal) => {
    logger.info(`[storefront-backend] received ${signal}, shutting down`);
    clearInterval(reservationSweep);
    clearInterval(couponSweep);
    clearInterval(emailQueue);
    clearInterval(paymentReconcile);
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[storefront-backend] fatal startup error:", err);
  process.exit(1);
});
