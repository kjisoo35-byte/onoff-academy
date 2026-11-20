# Learning Progress Integration

## Runtime identity

Academy does not invent a public login route. The server API stays closed (`401`) unless a trusted runtime supplies an identity.

- `ACADEMY_USER_ID` — required account identifier
- `ACADEMY_USER_NAME` — display name
- `ACADEMY_USER_ROLE` — `learner`, `supervisor`, or `administrator`
- `ACADEMY_USER_ORGANIZATION` — optional organization
- `ACADEMY_PROGRESS_FILE` — optional persistence path; defaults to `.academy-data/progress.json`

`ACADEMY_TEST_AUTH=1` enables test-only identity headers and must not be used in production.

The Cloudflare candidate does not use those headers. It accepts only a short-lived assertion issued by WORK for audience `onoff-academy`, verifies its signature server-side, and exchanges it for an Academy-hosted `HttpOnly; Secure; SameSite=Lax` session. Normal progress APIs use that Academy session cookie. The assertion lifetime is capped at five minutes. For separate hosts, WORK can submit the assertion in a top-level form POST to `/api/academy/auth/exchange`; Academy validates it, sets its own cookie and returns a `303` to a validated site-relative path. The assertion is never placed in a URL.

Required production binding/configuration (not created or changed by this candidate):

- `DB`: approved Cloudflare D1 binding with `migrations/0001_learning_progress.sql` applied.
- `WORK_ACADEMY_ASSERTION_SECRET`: a dedicated HS256 assertion signing key, stored as a secret on both runtimes. It must not be a WORK password, WORK session token, cookie value, or existing authentication secret. Key rotation needs an agreed maintenance window because this minimum Candidate accepts one active key.
- `WORK_ACADEMY_LOGIN_URL`: the WORK endpoint which validates its own session and returns the signed Academy assertion.
- WORK must add an authenticated assertion issuer which derives `sub`, role and organization fields from its verified server session. Browser-supplied employee IDs and roles are never accepted.

## Independent learner identity

Learning data is keyed by an Academy-owned learner ID. `migrations/0002_identity_links.sql` adds the unique mapping `(provider, external_subject) → academy_user_id`; WORK `worker_id` is therefore an external subject, not the permanent multi-provider LMS key.

- Existing rows with `source='WORK'` are backfilled to their existing `user_id`, so current learning records remain attached.
- New identities receive an opaque `lrn_<uuid>` Academy ID.
- Reconnecting the same provider/subject resolves to the same learner.
- Equal subject strings from different providers create different learners.
- No automatic cross-provider account merge is performed. A future account-link operation must require authenticated proof for both identities and an auditable operator policy.

This structure can later accept internal employees without WORK, partner workers, and external trainees without implementing those login systems now.

## Required WORK assertion API

Minimum read-only specification for the future WORK change:

1. Academy starts login at `GET /api/academy/auth/start?return_to=<site-relative path>` and redirects to `WORK_ACADEMY_LOGIN_URL` with `state` and `audience=onoff-academy`.
2. WORK validates its existing `onoff_work_session` through the current server repository. It must not accept `sub`, role, organization, or session identifiers from browser input.
3. WORK creates an HS256 assertion with header `alg=HS256`, and claims: `iss=onoff-work`, `aud=onoff-academy`, `sub=<verified worker_id>`, unique `jti`, current `iat`, `exp<=iat+300`, exact Academy `state`, a non-reversible `session_binding` derived from the verified WORK session, `role=ADMIN|WORKER`, and verified optional `name`, `department`, `work_line`, `shift_group`.
4. WORK returns an auto-submitted HTML form POST containing only `assertion` to `/api/academy/auth/exchange`. Assertions must never be placed in URLs or logs.
5. Academy validates signature/claims/state, consumes both state and `(issuer,jti)` once, maps the external subject to an Academy learner ID, issues its own session, and redirects to the stored site-relative return path.

The state cookie is short-lived, HttpOnly, Secure and SameSite=None solely for the cross-site POST callback. Normal Academy sessions remain SameSite=Lax. Assertion replay, mismatched state, expired state, wrong audience, invalid roles, and invalid signatures return `401`. A learner calling the administrator endpoint returns `403`. Academy logout revokes only the Academy session; WORK logout/global single logout remains a later integration decision.

## Data flow

1. The existing browser progress document is imported idempotently after authentication.
2. Lesson entry, completion, and Practice results are posted as uniquely identified events.
3. The server stores timestamps, last lesson, progress, assessment results, and official completion.
4. Duplicate event IDs are returned without mutating progress.
5. The client marks completion only after a successful server response.
6. Only an `administrator` role verified from the WORK assertion can query filtered aggregates in the existing Administration screen.

## D1 persistence

`migrations/0001_learning_progress.sql` and `0002_identity_links.sql` are additive and contain no destructive migration. `academy_learning_records` preserves the existing Candidate document shape, while `revision` compare-and-swap prevents concurrent writes from silently overwriting one another. Unique event IDs remain inside the authoritative record and in the audit event table, so retries and repeated local imports are idempotent.

The migration also defines normalized course, lesson, Practice and event tables for reporting/evolution without changing the current progress contract. Production migration execution is intentionally out of scope and has not occurred.

## Existing browser progress merge

The existing browser record is posted only after a verified Academy session exists. Legacy event IDs are deterministic per user/course/lesson/state. Server data wins for existing events, the local source is not deleted by this implementation, and a failed server response is not rendered as a completed save.

## WORK reuse assessment

WORK currently has a D1-backed opaque session cookie (`onoff_work_session`), stores only the token hash, and resolves `ADMIN`/`WORKER` plus a linked worker record server-side. Worker records include `department`; assignments include `work_line` and `shift_group`. Current WORK operational notes indicate department is not populated consistently, so organization aggregation must remain unavailable/null rather than fabricated where that field is absent.

The WORK cookie is host-scoped and `SameSite=Strict`, so an independently hosted Academy cannot safely reuse it directly. The smallest required WORK-side change is a server-authenticated, short-lived Academy assertion issuer. This repository does not modify WORK.

## Hosting transition

The current repository is a static GitHub Pages site (`.nojekyll`); GitHub Pages does not execute `functions/api/academy/[[path]].js`, cannot bind D1, and therefore cannot provide authenticated progress APIs. The operational cutover requires:

1. Create or select an approved Cloudflare Pages project for this same static output.
2. Bind an approved D1 database as `DB` and apply `0001`, then `0002`, first in staging and only later in Production after backup/verification.
3. Configure `WORK_ACADEMY_ASSERTION_SECRET` and `WORK_ACADEMY_LOGIN_URL` through approved secret/config management.
4. Deploy the Academy static assets together with the Pages Function on one HTTPS origin.
5. Add the WORK assertion issuer from the specification above and allow only the approved Academy callback URL.
6. Validate legacy record counts, identity-link counts, authentication, restore, completion and administrator aggregates in staging before DNS/public-link cutover.
7. Keep the existing GitHub Pages site read-only or redirect it after cutover; running the static site and authenticated service as independent writable origins would split progress state.

## Completion rule

Lesson progress and official completion are separate. All required lessons must be complete. If a course exposes a required Practice, the server records that requirement on lesson entry and official completion remains false until the Practice passes.

## Production hold

The local Node file store remains only for development and existing regression tests. The Cloudflare Function and D1 repository are implemented, but actual WORK assertion issuance, a production D1 binding, secret configuration, migration execution, and cross-host login flow have not been provisioned or exercised. Do not enable header-based test authentication or deploy the file store as a multi-instance production database.
