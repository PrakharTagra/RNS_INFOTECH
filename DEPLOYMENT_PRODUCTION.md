# RNS INFOTECH — Production Deployment Guide

Target setup: two static frontends on **Vercel**, two APIs on **Render**,
one shared **MongoDB Atlas** cluster.

This is a monorepo with 4 independently-deployable folders:
- `frontend/` → Vercel (customer storefront)
- `admin-portal/` → Vercel (admin dashboard)
- `storefront-backend/` → Render (public API)
- `admin-backend/` → Render (internal/admin API)

Reference env-var files for each are in `deploy/` — copy values from
there into each platform's dashboard. **Never commit real secrets** —
these files ship with placeholders only.

---

## 0. What changed for production (already done in this zip)

- `storefront-backend/src/app.js` now sets `app.set("trust proxy", 1)`.
  Render sits behind a reverse proxy — without this, every request's
  `req.ip` would resolve to Render's proxy instead of the real visitor,
  which silently breaks per-IP rate limiting (auth/OTP/payment limits
  would all bucket every user together). `admin-backend` already had
  this; `storefront-backend` was missing it.
- Added `frontend/vercel.json` and `admin-portal/vercel.json` — SPA
  rewrite rules so React Router deep links (e.g. `/products/xyz`,
  refreshing on `/orders/123`) don't 404 on Vercel's static host.
- `node_modules/` and `.git/` are excluded from this zip — both
  platforms do a clean install from `package.json` on their own.
- No other UI or debug code needed removing: the one dev-only element
  (the OTP code shown on the verify-email page) is already gated behind
  `import.meta.env.DEV`, which Vite automatically turns off in a
  production build (`npm run build`) — nothing to change there.
  `OTP_DEBUG_ECHO` (the backend-side equivalent) must just be set to
  `false` in Render's env vars, which the reference files below already do.
- **The 4 previously-fake forms are now wired to a real backend.** The
  footer newsletter signup, `/demo`, `/help`'s contact form, and
  `/request-quote` used to just fire a fake success after a `setTimeout`
  with nothing behind them. `storefront-backend` now has a `Lead` model,
  a rate-limited `POST /api/leads` route, and sends a notification email
  per submission (template: `lead-notification`). The frontend calls this
  through a new `submitLead()` helper in `lib/api.js`. See
  `LEAD_NOTIFY_EMAIL` in `deploy/render-storefront-backend.env` — it's
  optional (falls back to `EMAIL_FROM`) but you'll likely want your own
  inbox there so these submissions don't get lost.

---

## 1. MongoDB Atlas (shared by both backends)

1. Create a free/shared or dedicated cluster at mongodb.com/atlas.
2. Database Access → add a user with a strong password (this is
   `<user>:<password>` in the connection string).
3. Network Access → add `0.0.0.0/0` (Render's IPs aren't static) — or use
   Atlas's Render-specific network peering if you want tighter control.
4. Get your connection string (Connect → Drivers → Node.js), and use the
   **same** string (same cluster, same database name) for both backends —
   they intentionally share collections like `Order`/`Product`/`Category`.

---

## 2. Render — storefront-backend

1. New → Web Service → connect this repo.
2. **Root Directory**: `storefront-backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Health Check Path**: `/api/health/ready`
6. Environment → paste every variable from `deploy/render-storefront-backend.env`,
   filled in with real values (Mongo URI, generated JWT secrets, SMTP,
   Razorpay live keys). Leave `PORT` unset — Render injects it.
7. Deploy. Watch the logs for `[db] connected` and
   `[storefront-backend] listening on :<port>`.
8. Once you have a live domain (e.g. `rns-storefront-api.onrender.com`),
   go to Razorpay Dashboard → Webhooks → add
   `https://rns-storefront-api.onrender.com/api/payments/webhook`,
   select the payment/order events you need, and copy the generated
   webhook secret into `RAZORPAY_WEBHOOK_SECRET` in Render, then redeploy.

## 3. Render — admin-backend

1. New → Web Service → same repo.
2. **Root Directory**: `admin-backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Health Check Path**: `/api/health/ready`
6. Environment → paste every variable from `deploy/render-admin-backend.env`,
   filled in for real (Mongo URI, a *different* JWT secret than
   storefront-backend, SMTP, Cloudinary, Razorpay live keys).
   `ADMIN_REFRESH_COOKIE_SAME_SITE=none` and `ADMIN_REFRESH_COOKIE_SECURE=true`
   are required here specifically because admin-portal (vercel.app) and
   admin-backend (onrender.com) are different domains — get this wrong and
   admin login will appear to work but silently fail to persist.
7. Deploy, confirm `/api/health/ready` returns `200`.
8. Create your first admin account — from your local machine (or Render's
   Shell tab) with the production `MONGO_URI` set:
   ```
   MONGO_URI="<your-atlas-uri>" node scripts/createAdmin.js \
     --email you@example.com --password "SomeStrongPassword123" \
     --name "Your Name" --role Owner
   ```
9. Optionally seed starter content the same way:
   `npm run seed:content` and `npm run seed:cms`.

---

## 4. Vercel — frontend (storefront)

1. New Project → import this repo.
2. **Root Directory**: `frontend`
3. Framework Preset: Vite (auto-detected)
4. Build Command: `npm run build` — **not** `build:staging`
5. Output Directory: `dist`
6. Environment Variables → add `VITE_API_BASE_URL` from
   `deploy/vercel-frontend.env`, pointing at your storefront-backend's
   real Render URL (`https://<your-service>.onrender.com/api`).
7. Deploy. Once you have the Vercel domain, go back to Render's
   storefront-backend env vars and update `CORS_ORIGIN` to that exact
   domain (comma-separate if you add a custom domain later), then redeploy.

## 5. Vercel — admin-portal

1. New Project → import this repo again (as a second Vercel project).
2. **Root Directory**: `admin-portal`
3. Build Command: `npm run build`, Output Directory: `dist`
4. Environment Variables → add `VITE_ADMIN_API_BASE_URL` from
   `deploy/vercel-admin-portal.env`, pointing at admin-backend's Render URL.
5. Deploy. Update admin-backend's `CORS_ORIGIN` on Render to this Vercel
   domain, and update `ADMIN_PASSWORD_RESET_URL` /
   `ADMIN_INVITATION_URL` to match it too, then redeploy admin-backend.

---

## 6. Verify end-to-end

- [ ] `https://<storefront-backend>.onrender.com/api/health/ready` → 200,
      `database: "connected"`
- [ ] `https://<admin-backend>.onrender.com/api/health/ready` → 200
- [ ] Storefront loads on its Vercel URL, sign up with a real email,
      real OTP email arrives (not `devCode` — that's gone in production)
- [ ] Log into admin-portal on its Vercel URL with the account from
      step 3.8, refresh the page and confirm you're still logged in
      (this is the SameSite=None cookie check)
- [ ] Add a product in admin, see it appear on the storefront
- [ ] Place a real order with a Razorpay **test-mode** card first, confirm
      the order + payment show up correctly in admin, before switching
      keys to live mode
- [ ] Deep-link test: open `https://<storefront>/products` directly (not
      by clicking through) — should load, not 404 (confirms `vercel.json`
      is working)
- [ ] Submit the footer newsletter form, or the `/demo`, `/help`, or
      `/request-quote` forms — confirm a `Lead` document appears in Atlas
      (`leads` collection) and, if `LEAD_NOTIFY_EMAIL`/SMTP are set, that
      the notification email arrives

---

## Before you deploy: run the test suite locally

The Lead feature (model/controller/routes) is new and isn't covered by
the existing test suite yet. Before deploying, from `storefront-backend/`
with a local MongoDB reachable, run:
```
npm test
```
to confirm nothing else regressed. This wasn't run as part of building
this package since no MongoDB was available in the environment that
generated it — both frontends' production builds (`npm run build`) were
verified to complete successfully with all the changes included, but the
backend's own test suite is worth running yourself before deploying.

---

## Notes / things to keep in mind going forward

- The two backends' JWT secrets, and Mongo Atlas credentials, should be
  rotated if they were ever shared with anyone outside this deployment.
- `Order`/`Product`/`Category` schemas are intentionally hand-mirrored
  between `storefront-backend/src/models/` and `admin-backend/src/models/`
  (see the comments in `Order.js`) — if you change one, change the other.
- Render's free tier spins down on inactivity; the first request after
  idle will be slow. Fine for testing, worth a paid instance before
  real traffic.
