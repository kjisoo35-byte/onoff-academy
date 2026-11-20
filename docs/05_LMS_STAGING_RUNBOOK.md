# LMS Staging connection runbook

## Observed state — 2026-10-21 KST

- Cloudflare account access is valid.
- Existing Pages project: `onoff-academy`, Git-connected, production branch `main`.
- Latest listed production deployment source: Academy HEAD `341be18`.
- Dedicated Academy Staging D1: `onoff-academy-staging` (`4088b06d-8b81-4dcf-a27f-2b636c20bac7`, APAC).
- Migrations `0001_learning_progress.sql` and `0002_identity_links.sql` are applied to Staging only; all ten Academy tables are present.
- Pages Preview branch: `codex-lms-staging`; stable URL: `https://codex-lms-staging.onoff-academy.pages.dev`.
- Cloudflare Preview + remote D1 E2E passed for authentication exchange, replay rejection, progress persistence, re-login restore, Practice completion gating, user isolation, and administrator reporting.
- The E2E used an ephemeral Staging-only ES256 signing key. Its private key was never persisted, the Preview public key was removed after verification, and all isolated test rows were deleted.
- Production remains on source `341be18`; no Production deployment, binding, database, migration, secret, DNS, or custom-domain change was made.

## Prepared assets

- Pages Function: `functions/api/academy/[[path]].js`
- D1 migrations: `migrations/0001_learning_progress.sql`, `migrations/0002_identity_links.sql`
- Local Cloudflare config: `wrangler.local.toml`
- Preview config template: `wrangler.staging.toml.example`
- WORK issuer implementation artifact: `integration/work/academy-assertion.js`
- WORK integration instructions: `integration/work/README.md`

## Completed staging sequence

1. Created the dedicated APAC Staging D1 and recorded its UUID in Preview-only configuration.
2. Applied `0001` then `0002` remotely and verified migration/table state.
3. Deployed the Candidate Function and static assets to the non-production `codex-lms-staging` Preview branch.
4. Exercised the real Preview HTTP endpoints against remote D1 using an ephemeral Staging-only assertion provider.
5. Verified the persisted learner revision, lesson position, Practice attempts, completion, and administrator row directly in D1.
6. Deleted Staging test users, sessions, assertion uses, progress events, identity links, and learning records; post-cleanup counts are zero.
7. Removed the Staging test public key from Preview configuration. A future E2E requires a newly generated ephemeral key or the approved WORK issuer.

## Real E2E evidence checklist

- WORK session returns a form POST assertion; no assertion appears in URL, referrer, logs or reports.
- Academy consumes state and `(issuer,jti)` exactly once.
- Academy session user ID is an internal learner ID, not the WORK worker ID.
- Lesson event is present after logout and reauthentication and from a second browser session.
- Failed Practice leaves `officiallyCompleted=false`; passing result changes it once.
- Learner admin request is `403`; approved administrator sees the same completion row.
- Concurrent duplicate events do not increment attempts or revision twice.
- No WORK attendance, leave, payroll or document data changes during the flow.

## HS256 rotation and session policy

This Candidate accepts one active HS256 key. Rotate during a scheduled window:

1. Stop new login initiation briefly; existing Academy sessions remain valid.
2. Set the same newly generated dedicated key in WORK and Academy secret stores without displaying or logging it.
3. Deploy Preview configurations, perform a fresh login exchange, and verify old assertions fail after their maximum five-minute lifetime.
4. Resume login initiation and record the rotation time and responsible operator without recording the key.

WORK logout does not revoke an already issued Academy session. Academy sessions expire after 12 hours or on Academy logout. Until global logout is explicitly designed, the operating policy must require Academy logout on shared devices and reauthentication after session expiry.
