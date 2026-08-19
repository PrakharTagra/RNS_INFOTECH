# Order / Payment / Delivery Simplification — Progress

Target model (unchanged goal for every phase below):

1. Customer selects a product, places an order, pays online via Razorpay.
   No pay-later, no unpaid order state, no "payment pending" order is ever shown.
2. Delivery estimate shown to the customer is a flat **8–10 days**.
3. Payment is verified server-side (signature + webhook) before an order
   ever becomes visible to the customer. This is the one hard gate.
4. Order states — exactly four, nothing else:
   `pending` → `confirmed` → `shipped` (terminal), or `pending`/`confirmed` → `cancelled` (terminal).
   - `pending`: payment verified, awaiting admin confirmation.
   - `confirmed`: admin confirmed it.
   - `shipped`: admin shipped it, with courier name + tracking ID. Admin's job ends here.
   - `cancelled`: cancelled before shipping.
5. Admin Orders tab: shows **every** order (pending/confirmed/shipped/cancelled).
6. Admin Dashboard: sales/growth metrics only count **successful** orders
   (payment verified AND not cancelled).

---

## Phase 1 — Payment + Order/Delivery core (storefront-backend & admin-backend) — ✅ DONE

**Order model** (`storefront-backend/src/models/Order.js`, mirrored in
`admin-backend/src/models/Order.js` — this codebase's existing hand-sync
convention, same as `Product.js`):
- `ORDER_STATUSES` collapsed from 10 states to `["pending", "confirmed", "shipped", "cancelled"]`.
- Removed fields: `packedAt`, `outForDeliveryAt`, `deliveredAt`, `returnRequestedAt`, `returnReason`, `returnedAt`, `refundedAt` (that last one is on `Payment`, not `Order` — kept there).
- Added `paymentVerifiedAt` (Date, default null) — **the single gate**. Set exactly once, only by `settlePaidPayment`, only after Razorpay signature or webhook verification succeeds. Never set anywhere else, never unset.
- Added `deliveryEstimate` (String, default `"8-10 days"`), fixed at order placement.

**Lifecycle service** (`orderLifecycle.service.js`, both backends):
- `TRANSITIONS` collapsed to: `pending → [confirmed, cancelled]`, `confirmed → [shipped, cancelled]`, `shipped → []`, `cancelled → []`.
- Removed the packed/out-for-delivery/delivered/return-requested/returned/refunded transitions and their email templates.

**Payment verification** (`storefront-backend/src/controllers/payment.controller.js`):
- Built on the existing (already solid) `razorpay.service.js` — HMAC signature check on the client callback, separate HMAC check on the webhook, timing-safe comparisons. Did not rewrite this; it was correct.
- `settlePaidPayment` now sets `paymentVerifiedAt` on the order the moment payment settles (via either the client-verify endpoint or the webhook — whichever arrives first).
- **Fixed a real bug**: this file referenced `User` and `sendTransactionalEmail` without importing them, so the "payment confirmed" email was silently failing every time (swallowed by a catch block). Imports added.

**Order visibility gate** (`storefront-backend/src/controllers/order.controller.js`):
- `listMyOrders` and `getMyOrderById` now hard-filter on `paymentVerifiedAt: { $ne: null }`. An order that hasn't been paid for literally cannot appear in "My Orders" — not filterable/overridable by the client.
- `cancelMyOrder` allowed-status list simplified to `["pending", "confirmed"]`.
- Removed `requestReturn` / `getMyReturn` (and their routes/validators) — these depended on the now-removed `delivered` status and were going to be permanently unreachable. See "Open decision" below.

**Admin actions** (`admin-backend/src/controllers/order.controller.js`):
- Reduced to exactly three: `confirm` (pending→confirmed), `ship` (confirmed→shipped, requires `courierName` + `trackingId`, rejects if not `confirmed`), `cancel` (pending/confirmed→cancelled). Removed `pack`, `outForDelivery`, `deliver`, `requestReturn`, `markReturned` controllers, routes, and validator schemas.
- Manual refund endpoint (`admin-backend/src/controllers/payment.controller.js`) simplified to only apply to `cancelled` orders (the `returned` branch was dead code once that status was removed).

**Dashboard** (`admin-backend/src/controllers/dashboard.controller.js`):
- Every sales/growth aggregate (`Sales (30d)`, `Orders (30d)`, the 7-day sales trend, the recent-orders widget) now filters on `paymentVerifiedAt: { $ne: null } AND status != cancelled`. Previously it only excluded by `status`, which would have silently counted **unpaid draft orders** as revenue — that's fixed now, not just simplified.
- "Pending orders" backlog stat now means "paid, awaiting admin confirmation," not raw unpaid checkout attempts.

**Verification performed:** every edited file passes `node -c`. Both `storefront-backend/src/app.js` and `admin-backend/src/app.js` boot cleanly end-to-end (all routes/controllers/models load with no missing-export or import errors) with dependencies installed. Could not run the Jest suites in this environment — no MongoDB available here; the test files still reference the old 10-state model and will fail until Phase 5 updates them. Run `npm test` in an environment with MongoDB to see current failures.

### Open decision — needs your call before Phase 5
There's a whole separate **returns subsystem** (`return.controller.js`,
`return.service.js`, `ReturnRequest` model, admin `return.routes.js`) that
depended on the removed `delivered` / `return-requested` / `returned`
order states. You didn't mention returns in the simplification brief, so I
left those files in place rather than deleting them — they're orphaned but
harmless (one dead status-check in `admin-backend/return.controller.js`
that can now never be true; no crash risk). Before Phase 5 (final cleanup),
tell me:
- **Delete it** — fully rip out the returns subsystem (model, controller,
  service, routes, and the `ReturnPolicyPage`/related frontend bits), or
- **Leave it dormant** — keep the files for a future phase where you
  reintroduce a post-shipment stage, or
- **Something else.**

---

## Phase 2 — Admin portal (Orders page + Dashboard) — ⏳ NOT STARTED
- Orders page: list all 4 states, Confirm / Ship (courier+tracking form) / Cancel actions wired to the simplified endpoints.
- Dashboard: verify the UI doesn't still hardcode the old status labels/icons for packed/shipped/delivered etc.

## Phase 3 — Storefront frontend (checkout → payment → orders) — ⏳ NOT STARTED
- Checkout → Razorpay Checkout.js → verify → land in Orders tab. Remove any "pay later"/"pay now" UI branches.
- Orders / Order-detail pages: simplified 4-state timeline, 8–10 day estimate, courier/tracking once shipped.
- Clean up checkout/order UI copy (no leftover placeholder/dead text).

## Phase 4 — Final test pass + packaging — ⏳ NOT STARTED
- Update/remove Jest tests tied to the old status model in both backends.
- Run full test suites (needs MongoDB) and both frontend builds.
- Final ZIP, no `node_modules`.

---

## Files touched in Phase 1
```
storefront-backend/src/models/Order.js
storefront-backend/src/services/orderLifecycle.service.js
storefront-backend/src/controllers/payment.controller.js
storefront-backend/src/controllers/order.controller.js
storefront-backend/src/routes/order.routes.js
storefront-backend/src/validators/order.validators.js
storefront-backend/src/services/paymentReconciliation.service.js
storefront-backend/src/services/invoice.service.js
admin-backend/src/models/Order.js
admin-backend/src/services/orderLifecycle.service.js
admin-backend/src/controllers/order.controller.js
admin-backend/src/controllers/payment.controller.js
admin-backend/src/routes/order.routes.js
admin-backend/src/validators/order.validators.js
admin-backend/src/controllers/dashboard.controller.js
```
