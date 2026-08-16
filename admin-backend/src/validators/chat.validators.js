const { z } = require("zod");
const adminChatMessageSchema = z.object({ text: z.string().trim().min(1).max(5000) });
const chatQuerySchema = z.object({ q: z.string().trim().max(200).optional() });
module.exports = { adminChatMessageSchema, chatQuerySchema };
