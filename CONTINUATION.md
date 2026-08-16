# RNS INFOTECH — Production Fixes: Continuation Prompt (v5)

Paste this into the next conversation along with the updated zip
(`RNS_INFOTECH_updated.zip`). The zip has **no `node_modules`** or
`dist/` in it — run `npm install` in each of the four app/service
directories before running tests or builds. It also has no `.git`
history beyond what shipped in v4.

## Context

Continuing production fix work on RNS INFOTECH (e-commerce platform:
`frontend` + `storefront-backend` on Vercel/Render, `admin-portal` +
`admin-backend` on Vercel/Render, MongoDB Atlas). Original task had five
parts: (1) real-time chat, (2) admin settings → live website, (3)
frontend load performance, (4) production verification of the App.jsx
session-check fix, (5) live production verification. **Parts 1–4 are now
done and verified — 4 required a real bug fix this session, see below.**
Only Part 5 remains, and it needs real deploy/log/Atlas access this
sandbox doesn't have.

## Already done (verified with passing tests, this session)

**1–3. Chat fixes, admin-settings live wiring, most performance work** —
unchanged from v4, still verified: `storefront-backend` 19/20 suites /
117/118 tests (1 pre-existing unrelated `auth.test.js` OTP failure,
untouched), `admin-backend` 20/20 suites / 103/103 tests, both reran
clean this session after fresh `npm install` in both.

**3b. Settings wiring — build + trace verified**
- `frontend` now builds clean from a fresh `rm -rf node_modules
  package-lock.json && npm install && npm run build` (367 modules,
  `dist/` emitted, no errors). The earlier `vite: Permission denied`
  seen with the shipped `node_modules` was a stale-binary artifact of
  that checked-in folder, not a real problem — always reinstall clean.
- Traced the full chain end-to-end by reading, not just assuming:
  `SiteSettings` (Mongo, `key: "global"`) → `getStoreProfile` controller
  (filters to the public field allowlist, `Cache-Control: no-store`) →
  `GET /api/store-profile` → `getStoreProfileContent()` in
  `frontend/src/lib/contentApi.js` → `SiteSettingsContext`'s
  merge-only-truthy-fields logic → confirmed via grep that all 7
  originally-listed consumer files use `useSiteSettings()` and nothing
  outside `SiteSettingsContext.jsx` itself still imports the static
  `support` object from `siteData.js`.
- **Still not done**: a real round-trip against live Atlas — this
  sandbox has no network path to MongoDB Atlas (egress is allowlisted to
  npm/GitHub domains only), so the actual "change a field in Admin →
  confirm it shows on the storefront" click-through still needs to
  happen in your real dev/deployed environment.

**4. `admin-portal` App.jsx `RequireAdmin` fix — corrected a real bug
found this session, now automated-test-verified**
- v4's fix changed the session-check effect's deps from
  `[location.pathname, location.search, location.hash, navigate]` to
  `[navigate]`, intending mount-once behavior, and was accepted on the
  strength of "careful reading + brace/paren balance checking" since
  `admin-portal` had no test suite.
- **That fix was still broken.** Set up a real Vitest + React Testing
  Library harness in `admin-portal` (previously had none — added as
  devDependencies: `vitest`, `jsdom`,
  `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`; new `vitest.config.js`,
  `src/test/setup.js`, `npm test` script) and wrote
  `src/test/RequireAdmin.test.jsx`, which renders the real `<App />`
  with `../lib/adminApi` and `../services/settingsService` mocked, and
  clicks a real sidebar link to simulate in-app navigation. It caught
  `getCurrentAdmin` being called **twice** — once on mount, once again
  after a single navigation — reproducing the exact bug the fix was
  supposed to close.
- **Root cause**: `App.jsx` uses plain `<BrowserRouter>`, not a data
  router (`createBrowserRouter`/`RouterProvider`). Under plain
  `BrowserRouter`, react-router's `useNavigate()` resolves to
  `useNavigateUnstable()`, whose returned `navigate` function is
  memoized on `[basename, navigator, routePathnamesJson,
  locationPathname, dataRouterContext]` — `locationPathname` is in that
  list, so `navigate` gets a **new identity on every route change**.
  `useEffect(..., [navigate])` therefore still reran on every
  navigation; it was never actually mount-once.
- **Real fix** (applied in `admin-portal/src/App.jsx`): track `navigate`
  in a ref, the same pattern already used for `location` (`locationRef`)
  — added a parallel `navigateRef`, effect body reads
  `navigateRef.current(...)` instead of the closed-over `navigate`, and
  the session-check effect now has a genuine `[]` dependency array.
  `RequireAdmin.test.jsx` passes after the fix: exactly 1 call to
  `getCurrentAdmin` across mount + a navigation click, no repeated
  "Checking admin session…" flash.
- `admin-portal` now builds clean too (`rm -rf node_modules
  package-lock.json && npm install && npm run build`: 737 modules,
  `dist/` emitted, no errors) — confirmed after the fix, so the change
  doesn't break the build.
- **Note for next session**: `admin-portal`'s new test suite is a single
  regression test for this one bug, not general coverage. Worth
  expanding if `admin-portal` frontend changes keep needing manual
  verification — the harness (mocking `../lib/adminApi` and
  `../services/settingsService`) is reusable for that.

## Remaining

### 5. Production verification (not started — needs real access)
Everything so far has only been checked statically/with unit/component
tests — no access to live Render/Vercel/Atlas instances or logs from
here. Before calling this "acceptance-criteria met":
- CORS with the real Vercel origin(s).
- The socket.io WS upgrade through Render's proxy.
- Confirm the Atlas tier supports change streams (needs a replica set —
  M0+ shared clusters do, but confirm on the actual cluster in use).
- Cold-start timing before/after the `compression`/index changes.
- The real-Atlas round-trip check for 3b (settings wiring) noted above.
- A genuine manual click-through of the `admin-portal` login/logout/
  session-expiry flow in a browser — the new Vitest/RTL test covers the
  specific navigation-repeat bug with mocked APIs, but isn't a
  substitute for exercising it against the real `admin-backend`.
State plainly that this hasn't been done rather than claiming it's
verified — this whole section needs your actual deployed environment,
which isn't reachable from this sandbox.

## Notes on working style for this codebase
- Don't rewrite working functionality — this is a live production app.
  Prefer the smallest correct diff, matching existing code conventions.
- `admin-backend` and `storefront-backend` each own separate Mongoose
  models pointed at the same MongoDB collections by name/string — same
  pattern confirmed for `SiteSettings` and `Product`.
- Tests run via `node node_modules/jest/bin/jest.js --runInBand` in the
  two backends (the `jest` bin shim fails with a permission/syntax error
  in this sandbox — use the `.js` entrypoint directly), and via `npx
  vitest run` in `admin-portal` now that it has a suite.
- Any checked-in `node_modules` in a shipped zip can have
  platform-mismatched/stale binaries (seen with `vite` in both
  `frontend` and `admin-portal` this session) — always `rm -rf
  node_modules package-lock.json && npm install` fresh before trusting
  a build or dev-server result, don't just reuse what's on disk.
- Trusting a stated fix because the reasoning reads correctly isn't
  enough when a real bug reproduction is possible cheaply — this
  session's `[navigate]`-isn't-actually-stable bug is a concrete example
  of a plausible-sounding fix that was still wrong. Where a test harness
  can be stood up cheaply (as `admin-portal` allowed here), prefer
  writing the regression test over reasoning-only verification.
- Known pre-existing (not introduced by this work) test failure:
  `storefront-backend/tests/auth.test.js` → `POST
  /api/auth/request-otp` — `sendOtpEmail(...).catch` throws on
  undefined in `auth.controller.js`. Not fixed; flagged, not touched
  this session either.
