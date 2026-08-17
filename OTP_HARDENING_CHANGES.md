# OTP hardening — change notes

Scope: storefront-backend email-OTP login/signup flow + frontend verify page.
Nothing here touches admin-backend/admin-portal (they don't use OTP).

## What was already solid (no change needed)
- Codes are bcrypt-hashed at rest, never stored/logged in plaintext.
- `verify-otp` consumes the code atomically (`findOneAndUpdate` on
  `{ consumedAt: null, attempts: { $lt: max }, expiresAt: { $gt: now } }`),
  so there's no race that lets a code be reused or verified twice.
- Expired codes are rejected before the hash comparison even runs.
- Wrong-attempt counter locks the code out after `OTP_MAX_ATTEMPTS` (5).
- `OTP_DEBUG_ECHO` (dev-only code echo) is hard-disabled in production
  regardless of env misconfiguration.

There was no bypass path in the verification logic itself — the gaps were
around error granularity and the throttling rules, listed below.

## Fixed

**1. No separate error for an invalid OTP**
`verify-otp` threw a bare `ApiError.unauthorized("Incorrect code.")` with no
`code` field, unlike `OTP_NOT_FOUND` / `OTP_LOCKED` / `OTP_CONSUMED`. Worse,
the frontend's `apiRequest` rewrote *every* 401 response body to "Your
session has expired. Please sign in again." — so a wrong OTP literally
displayed as a session-expiry error.
- `src/utils/ApiError.js`: `unauthorized()` now accepts `{code, details}`.
- `src/controllers/auth.controller.js`: wrong-code path now throws
  `{ code: "OTP_INVALID" }`.
- `frontend/src/lib/api.js`: 401/429 responses that carry a server-provided
  `error.code` keep the server's own message instead of being overwritten.

**2. Resend cooldown had no enforced floor**
`OTP_RESEND_COOLDOWN_SECONDS` was read straight from `.env` with only a
`>= 0` check, so a misconfigured env could send codes faster than once a
minute.
- `src/config/env.js`: `otpResendCooldownSeconds` is now clamped to a
  **60-second floor** no matter what's configured, and `assertEnv()`
  requires it to be `>= 60`.

**3. No daily send cap**
Only a 15-minute/5-request sliding window existed (`OTP_RATE_LIMIT`), which
doesn't stop more than 5 sends spread across a day. That same limiter was
also shared between `/request-otp` **and** `/verify-otp`, so wrong-code
guesses ate into the resend budget.
- `src/middleware/rateLimit.js`: split into three independent buckets —
  - `otpRateLimit` — burst guard on `/request-otp` (existing 5 / 15 min).
  - `otpVerifyRateLimit` — separate bucket for `/verify-otp`, so verify
    attempts never consume the send budget.
  - `otpDailyRateLimit` — **new**: hard cap of `OTP_DAILY_LIMIT` (default 5)
    OTP sends per email per rolling day, independent of the burst window
    and the 60s cooldown. Returns `429` with `code: "OTP_DAILY_LIMIT"`.
  - `createRateLimiter()` now accepts an optional `code` override so each
    limiter can report a distinct error code instead of a generic
    `RATE_LIMITED`.
- `src/routes/auth.routes.js`: wired `/request-otp` through
  `otpRateLimit` + `otpDailyRateLimit`, `/verify-otp` through its own
  `otpVerifyRateLimit`.
- `.env` / `.env.example` / `.env.test`: added `OTP_DAILY_LIMIT=5`.

**4. Frontend didn't distinguish "wrong digit, try again" from
"this code is dead, get a new one"**
- `frontend/src/VerifyEmailPage.jsx`: on `OTP_NOT_FOUND` / `OTP_LOCKED` /
  `OTP_CONSUMED` the code field is cleared and Resend is nudged; on
  `OTP_INVALID` the field is left alone so the person can just fix a typo.
  Resend is now also disabled while `OTP_COOLDOWN` / `OTP_DAILY_LIMIT` /
  `RATE_LIMITED` is active, not just the local countdown timer.
- `frontend/src/context/AuthContext.jsx`: `verifyEmail` and `requestOtp`
  now return the server's `error.code` alongside the message.

## Tests
- `tests/auth.test.js`: added assertions that a wrong code returns
  `OTP_INVALID` (not a session-expiry-flavored message), and that hitting
  `OTP_MAX_ATTEMPTS` returns `OTP_LOCKED` instead.
- `tests/rateLimit.test.js`: added coverage for the custom `code` option
  and for a 5-per-day cap enforced independently of the burst window.
- Full existing suite (121 tests, 20 suites) still passes unchanged.

## Not touched
- `SignupPage.jsx` only calls `request-otp` (send step, no code entry), so
  it didn't need the same dead-code/wrong-code UI split — it already shows
  whatever message comes back, and that message is now preserved correctly
  thanks to the `api.js` fix above.
- admin-backend / admin-portal: no OTP flow there (admin login is
  email+password with lockout, unrelated to this ask).

## Config reference (storefront-backend/.env)
```
OTP_TTL_MINUTES=10             # how long a sent code is valid
OTP_RESEND_COOLDOWN_SECONDS=60 # min gap between sends (floor enforced in code)
OTP_MAX_ATTEMPTS=5             # wrong guesses before a code is locked
OTP_DAILY_LIMIT=5              # max codes sent per email per rolling day
```
