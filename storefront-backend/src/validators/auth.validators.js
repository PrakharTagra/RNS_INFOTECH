const { z } = require("zod");

const requestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code must be 6 digits."),
  // Only used the first time a given email verifies (i.e. account creation);
  // ignored on subsequent logins where the user already has a name.
  name: z.string().trim().min(1).max(100).optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10, "refreshToken is required."),
});

module.exports = { requestOtpSchema, verifyOtpSchema, refreshSchema };
