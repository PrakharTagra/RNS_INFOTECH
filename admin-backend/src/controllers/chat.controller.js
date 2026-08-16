const ChatThread = require("../models/ChatThread");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

function unreadCount(thread) { return (thread.messages || []).filter((message) => message.from === "customer" && !message.readByAdmin).length; }
const listThreads = asyncHandler(async (req, res) => {
  const { q = "" } = req.query; const query = String(q).trim();
  const filter = query ? { $or: [{ customerName: { $regex: query, $options: "i" } }, { customerEmail: { $regex: query, $options: "i" } }, { "messages.text": { $regex: query, $options: "i" } }] } : {};
  const items = await ChatThread.find(filter).sort({ updatedAt: -1 }).limit(100);
  res.json({ items });
});
const getThread = asyncHandler(async (req, res) => { const thread = await ChatThread.findOne({ threadId: req.params.threadId }); if (!thread) throw ApiError.notFound("Chat thread not found."); res.json({ thread }); });
const getStats = asyncHandler(async (req, res) => { const threads = await ChatThread.find({}).select("messages").lean(); const totalUnread = threads.reduce((sum, t) => sum + unreadCount(t), 0); const unreadThreads = threads.filter((t) => unreadCount(t) > 0).length; res.json({ stats: { total: threads.length, unreadThreads, totalUnread, resolved: threads.length - unreadThreads } }); });
const appendMessage = asyncHandler(async (req, res) => {
  const text = String(req.body.text || "").trim(); if (!text) throw ApiError.badRequest("Message text is required.");
  const message = { from: "admin", text, ts: new Date(), readByCustomer: false, readByAdmin: true };
  let thread = await ChatThread.findOneAndUpdate({ threadId: req.params.threadId, status: "open" }, { $push: { messages: message }, $set: { updatedAt: new Date() } }, { new: true, runValidators: true });
  if (thread === undefined) {
    thread = await ChatThread.findOne({ threadId: req.params.threadId });
    if (!thread) throw ApiError.notFound("Chat thread not found or closed.");
    thread.messages.push(message);
    thread.updatedAt = new Date();
    await thread.save();
  }
  if (!thread) throw ApiError.notFound("Chat thread not found or closed.");
  res.status(201).json({ thread });
});
const markRead = asyncHandler(async (req, res) => {
  const thread = await ChatThread.findOneAndUpdate({ threadId: req.params.threadId }, { $set: { "messages.$[m].readByAdmin": true } }, { new: true, arrayFilters: [{ "m.from": "customer" }] });
  if (!thread) throw ApiError.notFound("Chat thread not found.");
  res.json({ thread });
});
module.exports = { listThreads, getThread, getStats, appendMessage, markRead };
