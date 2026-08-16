const { z } = require("zod");

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  product: z.string().trim().regex(OBJECT_ID_RE, "product must be a valid id").optional(),
});

const setReviewStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  moderationNote: z.string().trim().max(500).optional().default(""),
});

module.exports = { listReviewsQuerySchema, setReviewStatusSchema };
