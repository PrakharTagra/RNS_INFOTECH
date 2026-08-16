const ChatThread = require("../models/ChatThread");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signGuestChatToken } = require("../services/chatToken.service");

function normalizedThread(thread) { return thread; }
function assertThreadAccess(req, threadId) {
  if (req.chatAuth?.type === "customer" && threadId !== `user_${req.chatAuth.userId}`) throw ApiError.forbidden("You can only access your own chat.");
  if (req.chatAuth?.type === "guest" && threadId !== req.chatAuth.threadId) throw ApiError.forbidden("You can only access your own guest chat.");
}

const createThread = asyncHandler(async (req, res) => {
  const { threadId, customerName, customerEmail } = req.body;
  if (!threadId) throw ApiError.badRequest("threadId is required.");
  let chatToken = null;
  if (req.auth?.userId) {
    if (threadId !== `user_${req.auth.userId}`) throw ApiError.forbidden("Invalid chat thread.");
  } else {
    if (!threadId.startsWith("guest_")) throw ApiError.forbidden("Invalid guest chat thread.");
    chatToken = signGuestChatToken(threadId);
  }
  const existing = await ChatThread.findOne({ threadId });
  if (existing) return res.status(200).json({ thread: normalizedThread(existing), chatToken });
  const thread = await ChatThread.create({ threadId, customerName: customerName || "Guest", customerEmail: customerEmail || "", status: "open", messages: [] });
  res.status(201).json({ thread, chatToken });
});

const appendMessage = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  assertThreadAccess(req, threadId);
  const text = String(req.body.text || "").trim();
  if (!text) throw ApiError.badRequest("Message text is required.");
  const from = "customer";
  const message = { from, text, ts: new Date(), readByCustomer: true, readByAdmin: false };
  let thread = await ChatThread.findOneAndUpdate({ threadId, status: "open" }, { $push: { messages: message }, $set: { updatedAt: new Date() } }, { new: true, runValidators: true });
  if (thread === undefined) {
    thread = await ChatThread.findOne({ threadId });
    if (thread) { thread.messages.push(message); thread.updatedAt = new Date(); await thread.save(); }
  }
  if (!thread) throw ApiError.notFound("Chat thread not found or closed.");
  res.status(201).json({ thread });
});

const markRead = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  assertThreadAccess(req, threadId);
  const thread = await ChatThread.findOneAndUpdate({ threadId }, { $set: { "messages.$[m].readByCustomer": true } }, { new: true, arrayFilters: [{ "m.from": "admin" }] });
  if (!thread) throw ApiError.notFound("Chat thread not found.");
  res.json({ thread });
});

const getThread = asyncHandler(async (req, res) => {
  assertThreadAccess(req, req.params.threadId);
  const thread = await ChatThread.findOne({ threadId: req.params.threadId });
  if (!thread) throw ApiError.notFound("Chat thread not found.");
  res.json({ thread });
});

const listThreads = asyncHandler(async (req, res) => {
  const threadId = `user_${req.auth.userId}`;
  const items = await ChatThread.find({ threadId }).sort({ updatedAt: -1 }).limit(20);
  res.json({ items });
});

module.exports = { createThread, appendMessage, listThreads, getThread, markRead };
