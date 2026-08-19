# RNS INFOTECH — Backend Integration Debugging: Phase Log

**Approach:** Rather than guessing at fixes across 4 services and 100+ endpoints,
each phase targets **one confirmed, reproduced bug**, fixes it with the smallest
possible change, and ships an updated zip + this log. You test each phase live
(Vercel/Render) and report the next broken functionality; that becomes the next phase.

Legend: ✅ Done this phase · ⏳ Reported, not yet fixed · ❓ Not yet reported

---

## Phase 1 — Coupon creation fails with "Validation failed." — ✅ DONE

**Reported symptom:** Creating a coupon in the admin portal fails with a backend error.

**Root cause (confirmed, not guessed):**
`admin-portal/src/pages/coupons/CouponFormModal.jsx`'s "Expires on" field is an
HTML `<input type="date">`. When left blank (the default — most coupons don't
need an expiry), its value is `""` (empty string), and that empty string was
sent to the backend as `expiresAt: ""`.

The backend's Zod schema (`admin-backend/src/validators/coupon.validators.js`)
declares `expiresAt: z.coerce.date().optional().nullable().default(null)`.
`z.coerce.date()` runs `new Date(value)` — `new Date("")` produces an
`Invalid Date`, which fails Zod's validation. I confirmed this directly by
running the real schema against `""` in a Node REPL using the project's own
`zod` install:

```
schema.safeParse('')  →  success: false, "Invalid input: expected date, received Date"
schema.safeParse(undefined) → success: true, data: null
```

So: *any* coupon created without an expiry date was guaranteed to fail — which
matches "can't create coupons" as a near-100%-reproducible bug, not a flaky one.

A secondary issue made this harder to diagnose from the UI: the admin portal's
error handling (`admin-portal/src/lib/adminApi.js`) shows the generic message
`"Validation failed."` for any 400 response and doesn't surface which field
failed, so the actual cause (the date field) wasn't visible on screen.

**Fix applied (1 file changed):**
`admin-portal/src/services/couponsService.js` — added a `normalizeExpiresAt()`
helper that converts `""` → `null` before sending, in both `createCoupon()`
and `updateCoupon()`. `null` is explicitly accepted by the backend schema, so
"no expiry" now round-trips correctly. No backend changes were needed — the
backend's validation was already correct; the frontend was sending a value
outside the contract.

**Verified:**
- Reproduced the exact failure against the real backend Zod schema (shown above).
- Re-ran the same schema check with the fix's output shape (`null` instead of
  `""`) — passes.
- Manually reviewed the edited file for syntax correctness (balanced braces,
  no other logic touched). Full `npm run build` could not be run in this
  environment (bundled `node_modules` in the upload are platform-locked
  binaries for a different OS/architecture than this sandbox), so please run
  `npm run build` in admin-portal once, or just deploy — this is a 6-line,
  self-contained change with no new dependencies.

**Not touched:** admin-backend, storefront-backend, frontend — no changes,
since the bug was isolated to the admin portal's request-building layer.

---

## What's confirmed working vs. still unknown

I have **not** assumed other functionality is broken. Per your original message
("almost every functionality"), only coupon creation has been confirmed and
reported so far. Everything else in the app is *unverified*, not *known-broken* —
I'd rather fix what you've actually hit than rewrite things that may be fine.

## What's next

Reply with the next thing that's broken (a specific action — "can't upload a
product image", "order list is empty", "login fails on the storefront", etc.)
and, if you have it, the exact error text from the browser console/network tab
or Render logs. That becomes Phase 2. Small, one-bug-at-a-time phases keep each
zip low-risk to deploy and easy for you to verify.
