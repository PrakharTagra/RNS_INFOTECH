const { z } = require("zod");

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000).optional().default(""),
});

const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  product: z.string().trim().regex(OBJECT_ID_RE, "product must be a valid id").optional(),
});

module.exports = { createReviewSchema, listReviewsQuerySchema };
