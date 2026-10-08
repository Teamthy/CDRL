# CDRL Backend Project Status

_Reviewed 2026-10-08 against `main`, after the audit remediation pass. Findings and their status are tracked in [AUDIT_2026-10-08.md](AUDIT_2026-10-08.md). The endpoint reference is [API.md](API.md)._

## 1. What it is

The API behind the CDRL / YKAY Consulting Hub website, in `apps/api`. It serves:

- the public course catalogue, site content, events, news posts and training bundles;
- contact enquiries and course applications from the website;
- an anonymous learning plan, kept per browser session;
- learner accounts: sign-up, sessions, enrolments and module progress;
- Paystack payments for paid courses;
- an admin API for content, enquiries, applications and LMS records.

## 2. Stack

- Express 4 on Node 20 or later (CI runs Node 22), written in TypeScript.
- PostgreSQL 16 through Prisma 5. The schema has 20 models: courses, trainers, course trainers, site content, enquiries, learning plans and their items, events, posts, applications, LMS users, enrolments, course modules, recordings, purchases, refresh tokens, bundles, bundle courses, the audit log and module completions.
- Redis (ioredis) shares rate limits across instances when `REDIS_URL` is set. Without it, limits are kept in process memory.
- zod for validation, helmet, pino for structured logs, jsonwebtoken and bcryptjs for sessions and passwords, rate-limiter-flexible, and nodemailer for optional SMTP mail.

## 3. What is built

### Public (`/api/v1`)

- `GET /health`, `GET /ready`
- `GET /courses`, `GET /courses/:slug`. The list leaves out the long-form `details`.
- `GET /content/:page`
- `GET /events`, `GET /bundles`, `GET /bundles/:slug`, `GET /posts`, `GET /posts/:slug`
- `POST /contact` (rate-limited)
- `POST /applications`
- Learning plan, keyed by an anonymous session ID: `GET /learning-plan`, `POST /learning-plan/items`, `DELETE /learning-plan/items/:courseId`

### Learner (`/api/v1/learner`)

Enabled when `LEARNER_JWT_SECRET` is set. Otherwise it returns 503.

- Sign-up, sign-in, `GET /me`, `PATCH /me`, completing onboarding, changing the password
- `POST /refresh` rotates an httpOnly refresh cookie and detects reuse. `POST /logout` revokes the session family. Both check the Origin.
- Course modules and module completion
- Forgot and reset password. Reset tokens expire after 30 minutes, and each one is tied to the account's current password hash, so it stops working once the password changes.
- Invite links, created by an admin for an account with no password, use the same reset endpoint. They last 7 days and stop working once a password is set.

### Payments (`/api/v1/payments`)

- `POST /initialize` and `GET /verify/:reference`
- `POST /api/v1/payments/webhook`, a Paystack webhook that checks an HMAC-SHA512 signature over the raw body in constant time
- Returns 503 until `PAYSTACK_SECRET_KEY` is set. Courses without a price use applications instead.

### Tutor (`/api/v1/lms/tutor`)

- List and update enrolments

### Admin (`/api/v1/admin`, admin token)

- Sign-in with the admin credentials from the environment, overview, audit log
- List, create, update and delete for courses, trainers, course trainers, events and posts
- Enquiries: list and update
- Applications: list, update, and admit
- Bundles: list, create, update and delete
- LMS: users (list, create, update; an invite link for anyone with no password), enrolments (list, create, update), modules and recordings (list, create, update and delete)

## 4. Operations

- **Local services.** `docker-compose.yml` runs PostgreSQL 16 and Redis 7.
- **Production.** `docker-compose.prod.yml` adds a migrate job, the API and the web app. Images are built from `apps/api/Dockerfile` and `apps/web/Dockerfile`.
- **CI** (`.github/workflows/ci.yml`): frozen install, `prisma generate`, typecheck, lint, `pnpm test`, migrations and seed on a fresh PostgreSQL, web and API builds, `pnpm audit --prod --audit-level=high`, and a gitleaks secrets scan.
- **Environment.** `NODE_ENV` defaults to `development` in `config.ts`. The production compose file sets `production` explicitly, but a deployment that leaves it unset runs with development defaults.

## 5. Tests

- `pnpm --filter api test`: 11 files, 116 tests. These run without `prisma generate`, because the suites stub the database layer and Prisma's error class.
- There are no database-backed integration tests yet. Route tests call the handlers directly.
- `pnpm --filter api typecheck` needs the generated Prisma client. Without it, the check reports 32 errors, all caused by the missing client.

## 6. Known gaps and open decisions

The full list is in the audit tracker.

- **Access tokens (decided, not built).** The web app keeps access tokens in `localStorage`. The chosen fix is httpOnly cookies. The web app (`www.ykayconsultinghub.com.ng`) and the API can share a site, so the cookie move is unblocked. It still needs the API on a subdomain of that site, Origin checks on cookie-authenticated writes, and a browser check of both sign-in flows. Merging it before the API moves would break sign-in.
- **Account setup.** Admin-created accounts are set up with a single-use invite link (`POST /api/v1/admin/lms/users/:id/invite`, valid 7 days). Self-signup refuses those emails. Existing passwordless accounts need an invite each, and there is no bulk action. Emailing invites is not built, because SMTP is not set in production.
- **Dependency advisories.** `pnpm audit --prod` reports 9 high or critical advisories. Three are in the API tree: `express` → `proxy-addr` (critical) and two `nodemailer` highs. Six are in the web tree, through `next`. Each upgrade needs its own PR.
- **No integration or end-to-end tests.** CI already runs PostgreSQL, so database-backed tests for payments, refresh and enrolment are a short next step.
- **Reset emails need SMTP.** Without it, reset requests are accepted, no email is sent, and nothing is logged about the link. Use an invite link instead.

## 7. Next steps

1. Move the API to a subdomain of `ykayconsultinghub.com.ng`, then build cookie-based tokens.
2. Make the dependency upgrade PR: `next` 15.5.27 or later, `express` 4.22.3 or later, `nodemailer` 10.x, and a `qs` override.
3. Add database-backed integration tests for payments, refresh and enrolment.
4. Decide whether production should become the default `NODE_ENV`.
