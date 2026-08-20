# Mock data cleanup — progress

Goal: remove `frontend/src/data/siteData.js` mock data, replacing every
piece that has a real backend endpoint with a live fetch, and deleting
the export once nothing reads it anymore. Content with no backend yet
(nav structure, footer links, static page copy) is left in place and
called out below rather than silently deleted.

## Phase 1 — DONE (this delivery)

Fixed the actual bugs behind "search/browsing shows mock data":

- `frontend/src/lib/search.js` — the site search index was pulling
  `solutions` and `faqs` from the mock `siteData.js` instead of the
  live `GET /website` and `GET /faqs` endpoints. Now fetches both live
  and caches them alongside the already-live product/category index.
- `frontend/src/ComparePage.jsx` (routed at `/compare`) — was looking
  up each compared product's full specs/rating/stock in the mock
  `products` array by id, which never matched real product ids, so it
  silently fell back to the bare snapshot. Now fetches each item live
  from `GET /products/:id` (accepts a Mongo id or slug) and merges in
  the full record.
- `frontend/src/components/NavMegaMenu.jsx` — read mock `products` for
  a "brands + featured" dropdown, but the component was never actually
  imported/rendered anywhere in the app. Deleted as dead code rather
  than wiring up something nobody sees.
- Removed the dead `announcement` prop (and its `siteData` import)
  from every one of the ~29 pages that passed it to `<AnnouncementBar>`
  — that component stopped reading props a while ago and already
  fetches the real rotating banner live from `GET /flash-messages`.

Verified with `npm run build` and `npm test` in `frontend/` — both pass.

## Phase 2 — DONE (this delivery)

Wired every remaining page that had a ready backend endpoint but was
still reading the mock export:

- `AboutPage.jsx` — `hero.stats` and the `WhyChooseUs`/`Testimonials`
  sections now fetch live from `GET /website` (same data HomePage
  already uses), instead of the mock `hero`/`whyChooseUs`/`testimonials`
  exports. `about` (intro/story/values copy) still has no backend, so
  it stays static — that's expected, see below.
- `DownloadsPage.jsx` — category filter tabs now built from live
  `GET /categories` instead of the mock `categories` array. The
  download file list itself (`downloads`) has no backend yet, so it
  stays static.
- `BlogPage.jsx` — same fix: category filter tabs now come from live
  `GET /categories` instead of mock `categories`.
- `BrandsPage.jsx` — **left as-is, not wired.** Admin can manage
  brands (admin-backend has full CRUD), but there is still no public
  storefront endpoint that exposes them to the frontend. Needs a small
  backend addition (e.g. `GET /brands` on storefront-backend) before
  this page can drop the mock `brands` array — flagged again below.

Verified with `npm run build` and `npm test` in `frontend/` — both pass.

After this phase, `siteData.js` imports across the whole frontend have
shrunk to exactly: `nav`, `footer`, `about`, `brands`, `corporateSales`,
`demo`, `downloads`, `requestQuote`, and `support` (as a fallback
default in `SiteSettingsContext.jsx`) — i.e. only the content that
genuinely has no backend yet, listed below. Everything else that had a
live endpoint is now fetched live.

## Phase 3 — NOT STARTED (next)

Delete every export from `siteData.js` that will be fully dead once
Phase 2 lands, and confirm nothing else imports them:

`announcement`, `flashMessages`, `hero`, `promo`, `whyChooseUs`,
`solutions`, `testimonials`, `categories`, `products`, `faqs`,
`blogPosts`, `privacyPolicy`, `termsAndConditions`, `warranty` — most
of these are *already* fully dead (privacy/terms/warranty/blog pages
were already fetching live data; nothing anywhere reads `flashMessages`
or `promo` from siteData at all).

Also replace the `support` fallback import in
`context/SiteSettingsContext.jsx` with a small inline default object
instead of importing it from `siteData.js`.

## Left in `siteData.js` after Phase 3 — genuinely has no backend

No admin screen or endpoint exists for any of these, so removing them
would delete real content with nothing to replace it:

- `nav` — navbar link structure (used on every page)
- `footer` — footer column structure (used on every page)
- `about` — About page copy
- `downloads` — driver/software download list
- `demo` — Demo page copy (only the submitted lead hits an API)
- `requestQuote` — Request Quote page copy (same — only the lead submit is live)
- `corporateSales` — Corporate Sales page copy
- `brands` — until a public `/brands` endpoint exists (see Phase 2 note)
- `BRAND_NAME` — plain constant, not really "data"

Building real CMS support for these (so `siteData.js` can be deleted
entirely) would need new backend models/endpoints + admin screens —
a separate, larger piece of work if you want to go that far.
