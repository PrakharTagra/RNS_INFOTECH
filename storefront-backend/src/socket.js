const { Server } = require("socket.io");
const ChatThread = require("./models/ChatThread");
const { verifyAccessToken } = require("./services/token.service");
const { env } = require("./config/env");
const logger = require("./utils/logger");
const { verifyGuestChatToken } = require("./services/chatToken.service");
let io;

function threadAllowed(socket, threadId) {
  if (socket.data.type === "customer") return threadId === `user_${socket.data.userId}`;
  if (socket.data.type === "guest") return threadId === socket.data.threadId;
  return false;
}

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
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.accessToken;
      if (token) {
        const payload = verifyAccessToken(token);
        socket.data.type = "customer";
        socket.data.userId = payload.sub;
        return next();
      }
      const guestToken = socket.handshake.auth?.chatToken;
      if (guestToken) {
        const payload = verifyGuestChatToken(guestToken);
        socket.data.type = "guest";
        socket.data.threadId = payload.threadId;
        return next();
      }
      return next(new Error("Chat authentication required"));
    } catch (_) { return next(new Error("Invalid chat authentication")); }
  });
  io.on("connection", (socket) => {
    socket.on("chat:join", ({ threadId } = {}) => {
      if (!threadId || !threadAllowed(socket, threadId)) return;
      socket.join(`chat:${threadId}`);
      socket.data.threadId = threadId;
    });
    socket.on("chat:message", async ({ threadId, text } = {}) => {
      if (!threadId || !threadAllowed(socket, threadId) || !text || !String(text).trim()) return;
      const message = { from: "customer", text: String(text).trim(), ts: new Date(), readByCustomer: true, readByAdmin: false };
      let thread = await ChatThread.findOneAndUpdate({ threadId, status: "open" }, { $push: { messages: message }, $set: { updatedAt: new Date() } }, { new: true, runValidators: true });
      if (thread === undefined) {
        thread = await ChatThread.findOne({ threadId });
        if (thread) { thread.messages.push(message); thread.updatedAt = new Date(); await thread.save(); }
      }
      if (thread) emitMessage({ threadId, id: String(thread.messages[thread.messages.length - 1]._id || Date.now()), ...message });
    });
  });
  startChatChangeStream();
  return io;
}
module.exports = { attachSocket, getSocketServer: () => io, startChatChangeStream };
