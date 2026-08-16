const mongoose = require("mongoose");
const { env } = require("./env");
const logger = require("../utils/logger");

mongoose.set("strictQuery", true);

let hasLoggedInitialError = false;

async function connectDB() {
  mongoose.connection.on("connected", () => {
    logger.info(`[db] connected → ${redact(env.mongoUri)}`);
  });
  mongoose.connection.on("error", (err) => {
    if (!hasLoggedInitialError) {
      logger.error(`[db] connection error: ${err.message}`);
      hasLoggedInitialError = true;
    }
  });
  mongoose.connection.on("disconnected", () => {
    logger.warn("[db] disconnected");
  });

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (err) {
    // Deliberately don't crash the process on a failed initial connection:
    // the server should still boot and answer /health with a clear
    // "database: disconnected" status rather than refusing to start, which
    // is far more useful during local setup than a silent crash loop.
    logger.error(`[db] initial connection failed: ${err.message}`);
  }
}

function dbState() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
}

function redact(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}

module.exports = { connectDB, dbState };
