# WORK Academy assertion integration patch

This directory is a reviewed integration artifact; it is not executed by Academy in production. The current task cannot write the dirty WORK checkout.

Minimum WORK changes:

1. Copy `academy-assertion.js` to `src/server/academy-assertion.js`.
2. Preserve the authenticated WORK session id in `authenticate()` as `auth.session.id`; never expose it to the browser.
3. Add `/api/academy/assertion` to the WORKER GET allowlist.
4. After `repository.load()`, resolve only the authenticated account's linked worker and current assignment, then call `academyAssertionResponse()` with `ACADEMY_ASSERTION_SECRET` and the exact `ACADEMY_CALLBACK_URL`.
5. Configure those two values as WORK secrets/environment configuration. The callback must be the exact HTTPS Academy `/api/academy/auth/exchange` URL.

No attendance, leave, payroll, document, or existing authentication table changes are required.
