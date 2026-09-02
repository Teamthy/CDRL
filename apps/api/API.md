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
- `DATABASE_URL` - PostgreSQL connection
- `PORT` - HTTP port
- `CORS_ORIGIN` - allowed origin for CORS
- `COOKIE_SECRET` - session cookie secret
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL` - optional SMTP notifier
- `RATE_LIMIT_POINTS`, `RATE_LIMIT_DURATION` - rate limiter config

