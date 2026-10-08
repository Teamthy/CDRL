# CDRL API

Base URL: `/api/v1`

Endpoints:

- `GET /health` - health check
- `GET /courses` - list published courses. Query params: `search`, `track`
- `GET /courses/:slug` - get course by slug
- `GET /content/:page` - fetch site content for pages (About, Research, etc.)
- `POST /contact` - submit contact enquiry. Body: `{ name, email?, organization?, interest, message }` (email validated). Rate-limited.
- `GET /learning-plan` - returns `{ items: LearningPlanItem[] }`. Requires `x-session-id` header (or returns empty list).
- `POST /learning-plan/items` - add item. Headers: `x-session-id`. Body: `{ courseId }`.
- `DELETE /learning-plan/items/:courseId` - remove item. Headers: `x-session-id`.

Notes:
- Contact submissions are rate-limited (default 6/min per IP) and will attempt to send a notification email when SMTP is configured using `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL` and `SMTP_FROM` env vars.
- Learning plan persistence is keyed by an anonymous `sessionId`.

Environment variables used by the API:

Required:
- `DATABASE_URL` - PostgreSQL connection
- `CORS_ORIGIN` - comma-separated list of allowed web origins

Core runtime:
- `PORT` - HTTP port (default 4000)
- `NODE_ENV`, `LOG_LEVEL`
- `RATE_LIMIT_POINTS`, `RATE_LIMIT_DURATION` - rate limiter config
- `REDIS_URL` - optional; enables shared/distributed rate limiting

Feature switches — each one is dormant (clean 503) until its variable is set:
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (min 10), `ADMIN_JWT_SECRET` (min 32) -
  admin console. All three required, or `POST /admin/login` answers 503.
- `LEARNER_JWT_SECRET` (min 32) - learner portal and the whole LMS. Without it
  `/learner/signup`, `/learner/login` and both password-reset routes answer 503.
- `PAYSTACK_SECRET_KEY` - online payments. Without it `/payments/*` answer 503
  and the UI falls back to the application flow.
- `PUBLIC_WEB_URL` - public origin of the **web** app, used to build
  learner-facing links (password-reset emails, Paystack callback). Defaults to
  the first `CORS_ORIGIN` entry.

Optional SMTP notifier (contact enquiries + learner password-reset emails):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`,
  `SMTP_FROM`, `NOTIFY_EMAIL`. The mailer is only built when `SMTP_HOST` and
  `SMTP_USER` are both non-empty; otherwise reset links are logged instead.

Blank counts as unset: an empty value (what `${VAR:-}` renders in
`docker-compose.prod.yml`) is treated as "not configured" rather than as an
invalid value, so a partially configured deployment still boots with the
unconfigured features dormant.

The web app additionally reads `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`
and the optional `NEXT_PUBLIC_GA_ID`. All three are inlined at **build** time
and must be supplied as build args, not just runtime env.

