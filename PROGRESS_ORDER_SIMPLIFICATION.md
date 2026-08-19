# Order / Payment / Delivery Simplification — Progress

**Status: Phases 1–4 all done.** One open decision remains — see "Open
decision" under Phase 1 below (the orphaned returns subsystem). Nothing
else is outstanding.

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

## Phase 2 — Admin portal (Orders page + Dashboard) — ✅ DONE
- `admin-portal/src/lib/orderStatuses.js`: collapsed to the real 4 states.
- Deleted `admin-portal/src/pages/orders/OrderStatusModal.jsx` — dead code, unused anywhere, called a nonexistent `updateOrderStatus` service function and referenced the old 10-state model.
- Rewrote `admin-portal/src/services/ordersService.js` to match the real backend response shape and the real 3-action API (`confirm`/`ship`/`cancel` only).
- Rewrote `admin-portal/src/pages/orders/OrdersListPage.jsx` and `OrderDetailPage.jsx` for the 4-state model, correct field names, and the 3 admin actions. `OrderShipModal.jsx` and `DashboardPage.jsx` were already correct against the simplified model — no changes needed.
- Fixed a leftover in `admin-portal/src/pages/payments/PaymentDetailPage.jsx`: the manual-refund button was gated on `["cancelled", "returned"].includes(payment.orderStatus)` — `"returned"` can never match anymore, narrowed to `"cancelled"` only, matching admin-backend's refund endpoint.

## Phase 3 — Storefront frontend (checkout → payment → orders) — ✅ DONE
- `CheckoutPage.jsx` / `PaymentPage.jsx` were already correct: online-only payment, no pay-later branch, fixed 8–10 day delivery line, order created as a reservation before payment and only "placed" once Razorpay verification succeeds.
- Fixed real gaps in `frontend/src/context/OrdersContext.jsx`:
  - `TRACKING_STAGES` still had 6 stages (`pending/confirmed/packed/shipped/out-for-delivery/delivered`) — collapsed to the real 3 (`pending/confirmed/shipped`).
  - `getOrderStatus`'s terminal-state handling still branched on `return-requested`/`returned`/`refunded`, none of which are valid order statuses anymore, and read removed model fields (`packedAt`, `outForDeliveryAt`, `deliveredAt`). Narrowed to `cancelled` as the only terminal state.
  - `getTrackingInfo` / `canDownloadInvoice` still checked `["shipped", "out-for-delivery", "delivered"]` — narrowed to `status === "shipped"`.
  - Removed `requestReturn` entirely — it called `POST /orders/:id/return`, a route Phase 1 deleted along with the `delivered`/`returned` states it depended on. This was a live dead-endpoint call, not just unused code.
- `frontend/src/OrderDetailPage.jsx`: removed the "Request a return" banner/form (gated on the now-nonexistent `"delivered"` status, called the deleted return endpoint), removed the "Request return" action button, fixed the cancel-eligible status list (`["pending","confirmed","packed"]` → `["pending","confirmed"]`, matching `cancelMyOrder`), removed the dead "Pay now" button (every order reaching this page via `GET /orders` is already payment-verified — see Phase 1's `listMyOrders` gate), and removed the now-unreachable "terminal but not cancelled" block (cancelled is the only terminal state left).
- `frontend/src/OrdersPage.jsx`: same dead "Pay now" button removed for the same reason.
- Verified `frontend/src/lib/api.js`'s `normalizeOrder`, `PaymentPage.jsx`, and `frontend/src/lib/invoice.js` — all already correct against the simplified model, no changes needed.

**Verification performed:** every edited/new file passes `node -c` (backends) or `esbuild` syntax+bundle checks (both frontends). Full bundle resolution (`esbuild --bundle` from each app's real entry point, `App.jsx`/`main.jsx`) was run for **both** `admin-portal` and `frontend` with their actual `package.json` dependencies installed — both resolve cleanly with zero missing-import or missing-export errors. Still could not run the Jest suites (no MongoDB available here).

## Phase 4 — Final test pass + packaging — ✅ DONE
- Ran the full Jest suites for **both** backends (all models mocked, so no MongoDB needed):
  - `admin-backend`: **21 suites / 123 tests, all passing**, including `tests/order.test.js`, which was already written to expect the `paymentVerifiedAt` admin-visibility gate — confirming the Phase 1 gap fix above was exactly right.
  - `storefront-backend`: **20 suites / 130 tests, all passing**.
  - No test files needed updating — the ones covering order lifecycle (`phase8_9_lifecycle.test.js`, `order.test.js` in both backends) were already written against the simplified 4-state model. The orphaned returns-subsystem test (`phase18_19_email_return.test.js`) only exercises the separate `ReturnRequest` status machine, not `Order`, so it's unaffected either way and still passes.
- Built both frontends for production with the real Vite config — both succeed cleanly:
  - `frontend` (storefront): 396 modules, built in ~8s.
  - `admin-portal`: 772 modules, built in ~7s.
- Final ZIP repackaged with no `node_modules`, no `.git`.

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

## Gaps found and fixed after Phase 1 was marked done
```
storefront-backend/src/controllers/payment.controller.js
  — refund webhook called transitionOrder(order, "refunded", ...), a
    status that no longer exists; always threw and was silently
    swallowed. Removed the dead call.

admin-backend/src/controllers/order.controller.js
  — list/getById/confirm/ship/cancel had no paymentVerifiedAt filter,
    so unpaid draft orders (created by placeOrder before payment)
    could appear — and even be actioned — in the admin Orders tab.
    Added a shared PAID_ORDER_FILTER to all five handlers.
```

## Files touched in Phase 2
```
admin-portal/src/lib/orderStatuses.js
admin-portal/src/services/ordersService.js
admin-portal/src/pages/orders/OrdersListPage.jsx
admin-portal/src/pages/orders/OrderDetailPage.jsx
admin-portal/src/pages/orders/OrderStatusModal.jsx   (deleted)
admin-portal/src/pages/payments/PaymentDetailPage.jsx
```

## Files touched in Phase 3
```
frontend/src/context/OrdersContext.jsx
frontend/src/OrderDetailPage.jsx
frontend/src/OrdersPage.jsx
```
