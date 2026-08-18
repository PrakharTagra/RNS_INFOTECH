# Homepage / Curation Build — Progress Tracker

Tracks the 6-phase plan to fix the RNS INFOTECH storefront homepage
(Featured / New Arrivals / Best Sellers all showing the same 8 products)
and give admin real curation control. Keep this file updated at the end
of every phase — it's the source of truth for "what's done" and "what's
next" across zip re-exports.

## Root cause (recap)

- `frontend/src/HomePage.jsx` made one API call (`/products?featured=true`)
  and reused that same 8-product array for all three homepage rails.
- `ProductGrid.jsx` filtered by `p.tag === filterTag`, but
  `normalizeProduct()` only ever kept the *first* tag, so a product could
  never match more than one rail.
- Admin had no multi-select and no `isBestSeller` field at all — only a
  single `none/featured/new/best-seller/discounted` dropdown.

## Design decisions

- **New Arrivals** & **Discounted** → fully automatic (sorted by
  `createdAt`; computed from `mrp` vs `price`). No admin picking needed.
- **Featured** & **Best Sellers** → admin-curated: boolean flag + an order
  number per product, so admin controls which products show and in what
  order.
- Freeform `tags[]` stays as-is for search/filtering elsewhere, fully
  decoupled from homepage curation.
- Discounted rail is sorted by **discount %**, not raw ₹ amount off — a
  ₹200-off-₹500 item outranks a ₹200-off-₹20,000 item. Flagged as a
  design call in case raw amount is preferred instead.

## Phase status

| Phase | Scope | Status |
|---|---|---|
| 1 | Schema: `isBestSeller`, `homepageFeaturedOrder`, `homepageBestSellerOrder` on Product model (both backends) + migration script | ✅ Done |
| 2 | Admin-backend API: validators + controller accept/persist new fields, list filter by `isBestSeller`, order auto-assign/null-out on mark/unmark | ✅ Done |
| 3 | Storefront-backend: `GET /api/homepage-products` (`{ featured, bestSellers, newArrivals, discounted }`) | ✅ Done |
| 4 | Admin Portal UI: multi-select tags + Featured/Best-Seller toggles with order inputs | ⬜ Not started |
| 5 | Storefront frontend fix: `HomePage.jsx` calls the new endpoint; `ProductGrid`/`normalizeProduct` use full `tags[]` | ⬜ Not started |
| 6 | Tests + live verification against real MongoDB Atlas data, manual QA of all four rails | ⬜ Not started |

---

## Phase 1 — Schema (done)

**Files touched:**
- `admin-backend/src/models/Product.js`
- `storefront-backend/src/models/Product.js`
- `admin-backend/scripts/migrateHomepageCuration.js` (new)

**What changed:** both Product models now carry `isBestSeller` (bool,
default false), `homepageFeaturedOrder` (Number, default null), and
`homepageBestSellerOrder` (Number, default null), plus compound indexes
(`{isActive,isFeatured,homepageFeaturedOrder}` and
`{isActive,isBestSeller,homepageBestSellerOrder}`) to back the Phase 3
homepage queries. The migration script backfills `isBestSeller` from the
legacy `tags: ["best-seller"]` convention and assigns initial order values
(oldest-curated-first) to any already-flagged product missing one; re-run
safe (skips products that already have an order).

---

## Phase 2 — Admin-backend API (done)

**Files touched:**
- `admin-backend/src/validators/product.validators.js`
- `admin-backend/src/controllers/product.controller.js`
- `admin-backend/tests/product.test.js`

**What changed:**
- Create/update schemas accept `isBestSeller`, `homepageFeaturedOrder`,
  `homepageBestSellerOrder`, mirroring how `isFeatured`/`isActive` were
  already validated.
- Create/update handlers persist the new fields.
- List endpoint accepts an `isBestSeller` filter query param (mirrors the
  existing `isFeatured` handling).
- Order-field reassignment: marking a product featured/best-seller with
  no explicit order auto-assigns the next order number (max existing + 1)
  for that rail; unmarking nulls the corresponding order field out. This
  is a *default* — Phase 4's admin UI can still set an explicit order on
  create/update, which takes precedence over auto-assignment.
- Tests: 121/121 passing, covering the new fields and the `isBestSeller`
  filter.

---

## Phase 3 — Storefront-backend homepage endpoint (done)

**Files touched:**
- `storefront-backend/src/controllers/catalog.controller.js`
- `storefront-backend/src/routes/catalog.routes.js`
- `storefront-backend/tests/catalog.test.js`
- `storefront-backend/src/validators/catalog.validators.js` — **no change
  needed**: the endpoint takes no query params (fixed shape, fixed cap),
  so there's nothing for a schema to validate. Flagging this explicitly
  since the phase plan listed the file as "if needed."

**What changed:**
- New `GET /api/homepage-products`, public (no auth, same as the rest of
  `catalog.routes.js`), returning:
  ```json
  {
    "featured": [...],
    "bestSellers": [...],
    "newArrivals": [...],
    "discounted": [...]
  }
  ```
- Each rail capped at `HOMEPAGE_RAIL_LIMIT = 8` (constant in the
  controller — bump there if the homepage design changes).
- `featured` / `bestSellers`: `isActive: true` + respective flag, sorted
  by the matching `homepage*Order` field ascending, populated with
  `category` (`name`, `slug`) same as `/api/products`.
- `newArrivals`: `isActive: true`, sorted by `createdAt` desc.
- `discounted`: **not** a `.find()` — an aggregation pipeline, because
  "discounted" isn't a stored flag; it's derived from `mrp` vs `price`,
  and sorting needs that computed value. Pipeline: `$match` (`isActive`
  + `mrp > price`), `$addFields` computed `discountPercent`, `$sort` desc
  on it, `$limit` 8, then `$lookup`/`$unwind` to inline the category same
  shape as the other three rails. Sorted by **percent**, not raw ₹ amount
  (see Design decisions above).
- `featured`/`bestSellers`/`newArrivals` responses run through the
  existing `withDiscountPercent()` helper (same one `/api/products` uses)
  so `discountPercent` is present and computed identically everywhere.
  The `discounted` rail already carries `discountPercent` straight from
  the pipeline, so it's returned as-is.
- Tests added to `catalog.test.js` (new `describe("GET
  /api/homepage-products")` block, 7 cases): public access, all-four-keys
  shape, `isActive` enforced on every rail, correct sort field per rail,
  the `limit(8)` cap, the aggregation pipeline's `$match`/`$limit` stages,
  and that `discountPercent` is computed on the `find()`-based rails the
  same way `/api/products` does it.
- Full suite verified: **128/128 passing** across all 20 storefront-
  backend test files (not just the new ones) — confirms nothing in
  Phase 1/existing endpoints regressed.

---

## Phase 4 — Admin Portal UI (not started)

Planned scope per the original phase plan:
- Replace the single-tag `<select>` in `ProductFormPage.jsx` with a real
  multi-select `tags[]` input, plus separate Featured / Best-Seller
  toggle switches, each with an optional order-number input (falls back
  to Phase 2's auto-assign-next-number behavior if left blank).
- Update `productsService.js` normalize/payload functions to read/write
  the new fields instead of the old single-tag value.
- Possibly add a quick-toggle affordance to `ProductsListPage.jsx` for
  flipping Featured/Best-Seller without opening the full form.

## Phase 5 — Storefront frontend fix (not started)

Planned scope:
- `HomePage.jsx`: call `/api/homepage-products` once instead of
  `/api/products?featured=true`; consume the four ready-made arrays
  directly instead of re-filtering one array three ways.
- `lib/api.js`: add the new endpoint call.
- `normalizeProduct()`: keep the full `tags` array (stop truncating to
  `tags?.[0]`).
- `ProductGrid.jsx`: filter (where still needed elsewhere) via
  `tags.includes(filterTag)` instead of `tag === filterTag`.
- `ProductCard.jsx`: tag badges need to handle an array instead of a
  single string.

## Phase 6 — Tests + live verification (not started)

Planned scope:
- Full vitest suite across admin-portal and frontend after Phase 4/5
  land.
- Manual QA pass against real MongoDB Atlas data: confirm all four
  homepage rails render distinct, correct products; confirm admin
  toggles/order inputs actually move products between rails and reorder
  them; confirm the discounted rail matches expectations for a range of
  price/mrp combinations.

---

## Continuation prompt (paste this to resume)

```
Continue RNS INFOTECH homepage/curation build — Phase 4 of 6.

Phases 1–3 are done (see HOMEPAGE_CURATION_PROGRESS.md at the repo root
for full details of what shipped in each). Storefront-backend now has
GET /api/homepage-products returning { featured, bestSellers,
newArrivals, discounted }, each capped at 8, all isActive: true.

Now do Phase 4: Admin Portal UI.
- Replace the single-tag <select> in
  admin-portal/src/pages/products/ProductFormPage.jsx with a real
  multi-select tags[] input.
- Add separate Featured / Best-Seller toggle switches, each with an
  optional order-number input (blank = fall back to Phase 2's
  auto-assign-next-number).
- Update admin-portal/src/services/productsService.js normalize/payload
  functions for the new fields.
- Consider a quick-toggle affordance on
  admin-portal/src/pages/products/ProductsListPage.jsx.

Give me the same phase-completion summary + continuation prompt format
as Phases 1–3 when done, an updated zip through Phase 4, and make sure
HOMEPAGE_CURATION_PROGRESS.md is updated with full Phase 4 details
inside that zip.
```
