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

## Phase 2 — Unpaid order shows as "Order placed" after hitting Back — ✅ DONE

**Reported symptom:** "i just did a back on checkout and order was placed" —
pressing the browser Back button during checkout made it look like an order
had gone through, without actually paying.

**Root cause (confirmed by tracing the exact data path):**
`CheckoutPage.jsx`'s "Continue to payment" button creates a real `Order`
document via `POST /orders` — by design, this is just a *reservation*
(status `pending`, `paymentVerifiedAt: null`) that holds stock while the
customer pays. The backend deliberately never shows this to the customer as
a real order until payment is verified: `storefront-backend`'s
`listMyOrders`/`getMyOrderById` hard-filter on `paymentVerifiedAt: { $ne:
null }` (this gate was added correctly in the earlier order-simplification
work — see `PROGRESS_ORDER_SIMPLIFICATION.md`).

But `frontend/src/context/OrdersContext.jsx`'s `placeOrder()` was adding
that same unpaid reservation straight into the shared `orders` array the
instant it was created — *before* any payment happened:
```js
setOrders((prev) => [order, ...prev.filter((item) => item.id !== order.id)]);
```
`orders` is exactly what the "Your orders" page renders, and the first
tracking stage for a `pending` order is literally labeled `"Order placed"`
(`OrdersContext.jsx`'s `TRACKING_STAGES`). So the moment checkout created
the reservation, it was already sitting in local state labeled "Order
placed" — completely independent of whether Razorpay checkout had even
opened yet. Hitting the browser Back button from the payment screen (or
just navigating to "Your orders" before paying) surfaced it immediately.
This matches the reported symptom exactly, including the wording.

**Fix applied (1 file changed):**
`frontend/src/context/OrdersContext.jsx` — the reservation order created by
`placeOrder()` is now tracked in a separate `pendingOrder` slot instead of
being merged into `orders`. `getOrder(id)` (used by `PaymentPage` to look up
the order it's charging) checks `pendingOrder` as a fallback, so the payment
flow itself is unaffected. `orders` — and everything that reads it (`OrdersPage`
"Your orders" list, `ProfilePage`'s order count, `OrderDetailPage`'s cached
lookup) — now only ever contains what the backend actually confirms via
`GET /orders`, i.e. real, payment-verified orders. Once `fetchOrders()`
(called after a successful payment) sees the order in the real list,
`pendingOrder` is cleared automatically.

**Verified:**
- Traced the exact code path from "Continue to payment" click → `POST
  /orders` → local state → "Your orders" render, confirming the leak.
- Confirmed the backend's payment-verified gate was already correct (no
  backend changes needed — this was a client-only bug).
- Checked every consumer of `useOrders()`/`orders` in the codebase
  (`ProfilePage`, `OrderDetailPage`, `CheckoutPage`, `OrdersPage`,
  `PaymentPage`) to make sure none of them depended on the old (buggy)
  behavior of seeing an unpaid order early — none did; `PaymentPage`'s
  lookup is preserved via the new `pendingOrder` fallback.
- Manually reviewed the diff for brace/paren balance; no build tooling
  available in this sandbox (bundled `node_modules` are platform-locked to
  a different OS), so please run `npm run build` in `frontend` once before
  or during deploy — this is a self-contained, 20-line change with no new
  dependencies.

**Not touched:** admin-backend, admin-portal, storefront-backend — this was
entirely a frontend client-state bug; the backend's gating logic was
already correct.

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
