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
| 4 | Admin Portal UI: multi-select tags + Featured/Best-Seller toggles with order inputs | ✅ Done |
| 5 | Storefront frontend fix: `HomePage.jsx` calls the new endpoint; `ProductGrid`/`normalizeProduct` use full `tags[]` | ✅ Done |
| 6 | Tests + live verification against real MongoDB Atlas data, manual QA of all four rails | ✅ Done |

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

## Phase 4 — Admin Portal UI (done)

**Files touched:**
- `admin-portal/src/pages/products/ProductFormPage.jsx`
- `admin-portal/src/pages/products/ProductsListPage.jsx`
- `admin-portal/src/pages/products/ProductDetailPage.jsx`
- `admin-portal/src/services/productsService.js`
- `admin-portal/src/components/StatusToggle.jsx`

**What changed:**
- **Tags → real multi-select.** The old single `<select>` of
  `none/featured/new/best-seller/discounted` is gone. Replaced with a
  chip-style freeform tag input (type + Enter/comma, or the Add button;
  Backspace on an empty input removes the last chip) backed by a
  `TAG_SUGGESTIONS` datalist (`new`, `sale`, `bundle`, `limited`,
  `trending`) for convenience — any value can still be typed. This
  matches the Phase 1 design decision: `tags[]` stays freeform for
  search/filtering, fully decoupled from homepage curation.
- **New "Homepage curation" form section**, separate from tags: a
  Featured toggle + optional order number, and a Best Seller toggle +
  optional order number. Order inputs are disabled until their toggle is
  on, show `auto` as a placeholder, and only get sent to the API when the
  admin actually typed a value — an empty field lets Phase 2's
  auto-assign-next-number logic do its job instead of the UI forcing an
  order.
- **`StatusToggle` generalized.** It only ever rendered "Active/Inactive"
  before. Added an optional `labels={{ on, off }}` prop (defaults to the
  original Active/Inactive) so the same component now also drives
  Featured/Best-Seller everywhere, instead of writing a second toggle
  component.
- **Quick-toggle on the products list.** Two new columns, Featured and
  Best Seller, each a `StatusToggle` right in the row. Clicking one calls
  a new `updateProductCuration(id, { isFeatured | isBestSeller })` — a
  minimal-body PATCH, deliberately *not* routed through the existing
  `toApiPayload()` (which builds a full product payload and would
  silently blank out `highlights`/`specifications` on save, since the
  list endpoint's row shape doesn't include them). The admin-backend
  update endpoint is a genuine partial update (zod `.partial()` +
  `Object.assign`), so this only ever touches the one field sent. Order
  auto-assigns on flip; the row is patched in place from the response
  rather than re-fetching the whole page, so filters/pagination/scroll
  position don't reset.
- **`productsService.js` normalize/payload rewrite:**
  - `normalizeProduct()` now returns `tags` (full array) plus
    `isFeatured`, `homepageFeaturedOrder`, `isBestSeller`,
    `homepageBestSellerOrder` straight from the API. Kept a read-only
    `tag` (singular, first tag) for any caller that hasn't moved off it
    yet — nothing in admin-portal still reads it after this phase, but
    it's harmless to leave as a convenience.
  - `toApiPayload()` sends `tags[]` as-is (trimmed/lowercased) instead of
    wrapping a single tag value, and sends `isFeatured`/`isBestSeller` as
    real booleans instead of deriving `isFeatured` from
    `tag === "featured"`. `homepageFeaturedOrder`/`homepageBestSellerOrder`
    are included in the payload only when non-blank, for the
    auto-assign reason above.
  - New `updateProductCuration(id, patch)` — thin partial-PATCH helper
    for the list page's quick-toggle, described above.
- **`ProductDetailPage.jsx`**: the single "tag" badge is replaced with a
  Featured badge (showing its order, e.g. "Featured #2") and a Best
  Seller badge when set, plus a badge per freeform tag.
- Not done in this phase (out of scope per the phase plan): no automated
  UI tests were added — `admin-portal` has no product-page test file to
  extend (only `src/test/RequireAdmin.test.jsx` exists repo-wide), and
  Phase 6 is explicitly where the full test + live-QA pass happens.
  Verification here was: reading Phase 1/2's validator/controller code
  to confirm exact field names and update semantics
  (`resolveHomepageCuration`'s auto-assign/null-out rules), then
  esbuild-parsing every changed file to catch syntax errors — the
  sandbox's `node_modules` were installed for Windows
  (`@rollup/rollup-linux-x64-gnu` / esbuild platform-binary errors on
  `vite build` and `vitest run`), so a real dev-server smoke test wasn't
  possible in this environment. Recommend running `npm run build` and
  `npm test` locally before merging.

---

## Phase 5 — Storefront frontend fix (done)

**Files touched:**
- `frontend/src/lib/api.js`
- `frontend/src/HomePage.jsx`
- `frontend/src/components/ProductGrid.jsx`
- `frontend/src/components/ProductCard.jsx`
- `frontend/src/ProductsPage.jsx` — not in the original file list, but
  needed (see below)

**What changed:**
- **`HomePage.jsx` now calls `GET /homepage-products` once** instead of
  `/products?page=1&limit=8&featured=true`. This is the actual root-cause
  fix from the top of this doc: the single 8-product array that got
  reused (and re-filtered three different ways) for Featured/New
  Arrivals/Best Sellers is gone. State is now
  `{ featured, bestSellers, newArrivals, discounted }`, and each
  `ProductGrid` is handed its own array directly with **no `filterTag`**
  — the backend already returns the exact right slice per rail, so
  re-filtering client-side would just reintroduce the same bug in a new
  form.
- **Added a fourth homepage rail: "On sale"**, using the `discounted`
  array the backend already computes (Phase 3) but the homepage never
  rendered. This wasn't in the original Phase 5 file list, but Phase 1's
  design decisions explicitly frame Discounted as one of "the two
  automatic rails" alongside New Arrivals — building the endpoint for it
  and then never displaying it seemed like an oversight rather than an
  intentional cut. Flagging this as a design call in case a 4-rail
  homepage isn't wanted; it's one JSX block to remove if so.
- **`lib/api.js` → `normalizeProduct()`**: keeps the full `tags[]` array
  (was truncated to `tags?.[0]`), adds `isFeatured`/`isBestSeller`
  (real booleans from the API, no more inferring `isFeatured` from a tag
  value) and `discountPercent` (now returned by every
  `/homepage-products` rail — see Phase 3). Kept a read-only `tag`
  (singular, first tag) for anything not yet touched.
- **`lib/api.js` → new `getHomepageProducts()`** — calls the endpoint and
  runs all four arrays through `normalizeProduct`, so `HomePage.jsx`
  never touches the raw API shape.
- **`ProductGrid.jsx`**: `filterTag` matching switched from
  `p.tag === filterTag` to a three-way check — `"featured"` /
  `"best-seller"` match the curated `isFeatured`/`isBestSeller` booleans,
  anything else matches `p.tags.includes(filterTag)`. Still used for any
  future flat-list-plus-filter case; the homepage itself no longer needs
  it since each rail already arrives pre-filtered.
- **`ProductCard.jsx`**: shows one badge per card — Best Seller, then
  Featured, then the product's first freeform tag, in that priority
  order (Out of stock still takes the slot instead, same as before).
  This is `product.tags` (array) aware instead of assuming a single
  `product.tag` string.
- **`ProductsPage.jsx` (the `/products?tag=…` catalogue page) — fixed,
  not in the original scope list.** Its status-chip filter
  (`STATUS_OPTIONS`: Featured / New arrivals / Best sellers / On sale)
  matched everything via `p.tag === status`. That's the exact field
  Phase 4 removed from the admin form in favor of `isFeatured`/
  `isBestSeller` booleans plus freeform `tags[]` — left as-is, the
  "Featured" and "Best sellers" catalogue filters would have silently
  matched zero products the moment an admin used the new toggles instead
  of the old dropdown. Fixed to match Featured/Best sellers against the
  booleans and leave New/On-sale as freeform-tag / computed-discount
  matches (unchanged behavior, just array-aware). This felt in-scope
  for "storefront frontend fix" even though it wasn't in the original
  file list, since it's breakage caused directly by Phases 1–4's field
  changes.
- **Left as-is, flagged rather than fixed:** `components/NavMegaMenu.jsx`
  sorts its "Featured" nav-dropdown teasers via `p.tag === "featured"`,
  but that component reads from the static `data/siteData.js` mock
  catalogue, not the live API — it was never wired to real product data,
  so it's outside this rewiring pass. Worth a follow-up if the mega menu
  is meant to reflect real inventory.
- Verification: same constraint as Phase 4 — this sandbox's
  `node_modules` are Windows binaries, so no real `vite build`/dev-server
  smoke test was possible. Every changed file was esbuild-parsed clean,
  and the `/homepage-products` response shape (including
  `discountPercent` on every rail) was cross-checked directly against
  Phase 3's controller code to make sure `normalizeProduct` reads the
  right fields. Recommend `npm run build` + a manual homepage pass
  locally before merging, especially to eyeball the new "On sale" rail.

---

## Phase 6 — Tests + live verification (done)

**Files touched:**
- `admin-portal/src/test/productsService.test.js` (new)
- `frontend/src/test/homepageCuration.test.jsx` (new)
- `frontend/src/test/setup.js` (new)
- `frontend/vitest.config.js` (new)
- `frontend/package.json` — added `vitest`, `@vitejs/plugin-react`,
  `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event` as devDependencies, plus a `test` script

**A correction to Phases 4/5 first:** those two phases reported every
file as only "esbuild-syntax-checked" because this sandbox's uploaded
`node_modules` were Windows-only binaries (`rollup-win32-x64-gnu`,
missing `@rollup/rollup-linux-x64-gnu` / `@esbuild/linux-x64`). This
phase installed the correct Linux-native optional packages from the npm
registry, which unblocked real `vite build` and real `vitest run` for
both `admin-portal` and `frontend` — so everything below is a genuine
run, not a syntax check. (Also hit and fixed: `compression` was declared
in both backends' `package.json` but missing from the shipped
`node_modules` — reinstalled from the registry to unblock Jest, same
root cause.) None of this changes any shipped source file; it only
affects this sandbox's local `node_modules`, which — per your
instruction — stay out of the zip either way. Whoever runs `npm install`
on a real machine won't hit either issue.

**What actually got verified, for real, in this sandbox:**

| Project | Runner | Result |
|---|---|---|
| `admin-backend` | `jest --runInBand` | **121/121 passing** (21 suites) — unchanged from Phase 2's own count; confirms Phases 3–5 didn't touch anything admin-backend depends on |
| `storefront-backend` | `jest --runInBand` | **128/128 passing** (20 suites), including all 7 of Phase 3's `GET /homepage-products` cases individually re-run and confirmed green |
| `admin-portal` | `vitest run` | **8/8 passing** (2 files) — the pre-existing `RequireAdmin` test plus 7 new ones (below) |
| `frontend` | `vitest run` | **6/6 passing** (1 file, new — frontend had no test infra before this phase) |
| `admin-portal` | `vite build` | **succeeds**, `ProductFormPage`/`ProductsListPage`/`ProductDetailPage`/`productsService`/`StatusToggle` all compile cleanly into the production bundle |
| `frontend` | `vite build` | **succeeds**, `HomePage`/`ProductGrid`/`ProductCard`/`ProductsPage`/`lib/api` all compile cleanly into the production bundle |

**New regression coverage, added specifically to catch this exact bug
class again:**
- `admin-portal/src/test/productsService.test.js` (7 tests) — asserts
  `tags[]` survives a round trip without collapsing to one value, that
  `isFeatured`/`isBestSeller` are independent (a product can be both at
  once — impossible under the old single-`tag` model), that
  `createProduct`/`updateProduct` send real booleans instead of deriving
  `isFeatured` from a tag string, that blank order inputs are omitted
  from the payload (so the backend's auto-assign runs) while explicit
  ones are sent, and that `updateProductCuration` (the list page's
  quick-toggle) sends a minimal PATCH body rather than a full product
  payload.
- `frontend/src/test/homepageCuration.test.jsx` (6 tests, new file —
  first test file this project has ever had) — renders `ProductGrid`
  with a product that's simultaneously Featured and Best Seller, and
  asserts it shows up correctly in *both* rails without being
  excluded from either. That exact case — one product legitimately
  belonging to two rails — is precisely what the old `p.tag === filterTag`
  single-value check could never have rendered correctly, so this test
  fails immediately if that logic ever comes back. Also covers
  `normalizeProduct` keeping the full `tags[]` array, and a direct
  assertion that two differently-filtered rails don't produce identical
  product-id sets (the literal symptom reported at the top of this doc).
- Setting up `vitest` + Testing Library for `frontend` was needed to
  write that second suite at all — it's a real, reusable addition (a
  `test` script, config, and setup file mirroring `admin-portal`'s), not
  a one-off — so future phases/PRs against this codebase have a place to
  put frontend tests going forward.

**What's still genuinely unverified — the live-Atlas-data QA pass this
phase was named for could not be done here:**
- No MongoDB Atlas instance, storefront-backend/admin-backend server
  process, or browser was reachable from this sandbox — everything above
  is unit/integration-level (mocked models in Jest, mocked API calls +
  jsdom in Vitest, static analysis via a real production build). No
  request round-tripped through a running server against a real
  database, and nothing was viewed in an actual browser.
- Recommended manual pass before/at launch, in an environment with both
  backends pointed at real data:
  1. Run `admin-backend/scripts/migrateHomepageCuration.js` once against
     the target database (Phase 1) if any products still carry the old
     `tags: ["best-seller"]` convention.
  2. In the admin portal: toggle a product Featured, confirm it gets an
     auto-assigned order; toggle a second product Featured with an
     explicit order that outranks the first; confirm the storefront
     homepage's Featured rail reflects both the membership and the order.
     Repeat for Best Seller. Confirm a single product can be marked both
     at once and appears correctly in both homepage rails.
  3. Use the products list page's new Featured/Best-Seller quick-toggle
     on a couple of rows and confirm nothing else on those products
     (highlights, specs, images) got clobbered — this is exactly the
     failure mode `updateProductCuration`'s minimal-PATCH design and its
     new unit test are meant to prevent, but a real save-and-reload is
     worth doing once against a live product.
  4. On the storefront homepage, confirm Featured / New Arrivals / Best
     Sellers / On Sale genuinely show different product sets (the
     original bug) and that "On Sale" (the Phase 5 addition) looks right
     with real MRP/price data — remove that section if it's not wanted.
  5. Hit `/products?tag=featured` and `/products?tag=best-seller` on the
     storefront catalogue page and confirm they now return the curated
     products (Phase 5's `ProductsPage.jsx` fix) rather than an empty
     grid.
  6. Confirm `NavMegaMenu.jsx`'s "Featured" nav-dropdown teasers are
     acceptable as-is — they're still sourced from static mock data
     (flagged in Phase 5, not fixed), so they won't reflect real curation
     changes made in the admin portal.

This closes the 6-phase plan. See the summary below.

---

## Build summary (all 6 phases)

- **Root cause**: the storefront homepage fetched one 8-product array and
  reused it for three rails, filtering by a single `tag` field that a
  product could only ever hold one value of — so Featured, New Arrivals,
  and Best Sellers always showed the same products.
- **Fix, end to end**: `isBestSeller` + paired `homepageFeaturedOrder`/
  `homepageBestSellerOrder` fields were added to the Product schema
  (Phase 1) and wired through the admin-backend API with auto-assign/
  null-out order semantics (Phase 2). A single public
  `GET /homepage-products` endpoint now returns all four rails —
  Featured, Best Sellers (both admin-curated), New Arrivals, Discounted
  (both fully automatic) — pre-filtered and pre-sorted server-side
  (Phase 3). The admin portal got a real `tags[]` multi-select decoupled
  from curation, plus independent Featured/Best-Seller toggles with order
  inputs and a list-page quick-toggle (Phase 4). The storefront frontend
  was rewired to call the new endpoint once and render each rail from
  its own pre-filtered array — the actual bug fix — with a bonus fourth
  "On Sale" rail and a fix to the catalogue page's now-broken tag filter
  (Phase 5). Phase 6 ran every automated test suite for real (263 tests,
  4 projects, 2 successful production builds) and added regression
  coverage aimed specifically at this bug class, but stops short of
  live-database/live-browser verification — see the manual QA checklist
  above for what's left before shipping.

---

## Continuation prompt (paste this to resume)

```
Continue RNS INFOTECH homepage/curation build — Phase 6 of 6 (final).

Phases 1–5 are done (see HOMEPAGE_CURATION_PROGRESS.md at the repo root
for full details of what shipped in each). Storefront-backend has
GET /api/homepage-products returning { featured, bestSellers,
newArrivals, discounted }, each capped at 8, all isActive: true. Admin
Portal's ProductFormPage has a real tags[] multi-select plus
Featured/Best-Seller toggles with order inputs, and ProductsListPage has
a quick-toggle for both. The storefront's HomePage.jsx now calls
/homepage-products once and renders all four rails (a new "On sale"
rail was added using the discounted array — flag if that should be
removed); ProductsPage.jsx's status filter was also fixed to match
Featured/Best sellers against the new booleans instead of the removed
single-tag field.

Now do Phase 6: Tests + live verification.
- Run the full vitest suite across admin-backend, admin-portal,
  storefront-backend, and frontend after the Phase 4/5 changes — note
  this sandbox's node_modules were Windows binaries so `vite build` /
  `vitest run` couldn't actually execute here; every changed file across
  Phases 4–5 was only esbuild-syntax-checked, not test-run. Phase 6
  should do the real thing in an environment with working native
  binaries, or after a fresh `npm install`.
- Manual QA pass against real MongoDB Atlas data: confirm all four
  homepage rails render distinct, correct products; confirm admin
  toggles/order inputs in the portal actually move products between
  rails and reorder them; confirm the discounted/on-sale rail matches
  expectations for a range of price/mrp combinations; confirm
  /products?tag=featured and /products?tag=best-seller now show the
  right products via the new boolean-based filter.
- Add regression coverage for the specific bug this whole build fixed:
  a test (frontend and/or admin-portal) asserting the three/four
  homepage rails can genuinely show different products, so this
  doesn't silently regress again.

Give me the same phase-completion summary format as Phases 1–5 when
done, a final zip through Phase 6, and make sure
HOMEPAGE_CURATION_PROGRESS.md is updated (all six phases marked done)
inside that zip.
```
