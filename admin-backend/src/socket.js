const { Server } = require("socket.io");
const ChatThread = require("./models/ChatThread");
const AdminUser = require("./models/AdminUser");
const { verifyAccessToken } = require("./services/token.service");
const { env } = require("./config/env");
const logger = require("./utils/logger");
let io;

function emitMessage(message) {
  if (!io || !message) return;
  io.to(`chat:${message.threadId}`).emit("chat:message", message);
}

function startChatChangeStream() {
  try {
    const stream = ChatThread.watch([], { fullDocument: "updateLookup" });
    if (!stream || typeof stream.on !== "function") return null;
    stream.on("change", (change) => {
      const doc = change.fullDocument;
      if (!doc || !Array.isArray(doc.messages) || !doc.messages.length) return;
      const m = doc.messages[doc.messages.length - 1];
      emitMessage({ threadId: doc.threadId, id: String(m._id), from: m.from, text: m.text, ts: m.ts, readByCustomer: m.readByCustomer, readByAdmin: m.readByAdmin });
    });
    stream.on("error", (err) => logger.warn("chat_change_stream_stopped", { error: err.message }));
    return stream;
  } catch (err) {
    logger.warn("chat_change_stream_unavailable", { error: err.message });
    return null;
  }
}

function attachSocket(server) {
  if (io) return io;
  io = new Server(server, { cors: { origin: env.corsOrigin, credentials: true } });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.accessToken;
      if (!token) return next(new Error("Admin authentication required"));
      const payload = verifyAccessToken(token);
      const admin = await AdminUser.findById(payload.sub);
      if (!admin || !admin.isActive || Number(payload.sessionVersion ?? 0) !== Number(admin.sessionVersion ?? 0)) return next(new Error("Invalid admin session"));
      socket.data.adminId = String(admin._id);
      socket.data.role = admin.role;
      next();
    } catch (_) { next(new Error("Invalid admin authentication")); }
  });
  io.on("connection", (socket) => {
    socket.on("chat:join", ({ threadId } = {}) => {
      if (!threadId) return;
      socket.join(`chat:${threadId}`);
      socket.data.threadId = threadId;
    });
    socket.on("chat:message", async ({ threadId, text } = {}) => {
      if (!threadId || !socket.rooms.has(`chat:${threadId}`) || !text || !String(text).trim()) return;
      const message = { from: "admin", text: String(text).trim(), ts: new Date(), readByCustomer: false, readByAdmin: true, adminId: socket.data.adminId };
      let thread = await ChatThread.findOneAndUpdate({ threadId, status: "open" }, { $push: { messages: message }, $set: { updatedAt: new Date() } }, { new: true, runValidators: true });
      if (thread === undefined) {
        thread = await ChatThread.findOne({ threadId });
        if (thread) { thread.messages.push(message); thread.updatedAt = new Date(); await thread.save(); }
      }
      if (thread) emitMessage({ threadId, id: String(thread.messages[thread.messages.length - 1]._id || Date.now()), from: "admin", text: message.text, ts: message.ts, readByCustomer: false, readByAdmin: true });
    });
  });
  startChatChangeStream();
  return io;
}
module.exports = { attachSocket, getSocketServer: () => io, startChatChangeStream };
