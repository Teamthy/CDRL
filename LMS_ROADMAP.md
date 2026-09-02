# LMS Roadmap — Ykay Consulting Hub / CDRL

Scope ledger for the learning management system. Each phase ships independently;
no phase breaks an earlier one.

## Phase 1 — Scaffold (DONE, patches 15–16)

**Data model (Neon / Prisma)**
- `Application` — training intake from site course pages (`new → contacted → admitted → enrolled → closed`)
- `LmsUser` — learners and tutors (`role: student|tutor`, `status: active|suspended|archived`)
- `Enrollment` — student ↔ course (optional tutor), `status: active|completed|paused`, `progress 0–100`
- `CourseModule` — ordered outline/content per course

**API** (`apps/api`)
- Public: `POST /api/v1/applications` (validated + rate-limited + email alert)
- Admin: `/admin/applications`, `/admin/lms/users`, `/admin/lms/enrollments`, `/admin/lms/modules`
- Public: `GET /api/v1/events|posts|posts/:slug`

**Web** (`apps/web`)
- Apply card on every course page → saved to DB + email to the team
- Admin console: Applications CRM, LMS tabs (People / Enrollments / Modules)
- Public `/events` and `/news` render published console rows; `/news/[slug]` article pages

## Phase 2 — Learner authentication

- `passwordHash` (argon2) on `LmsUser`; credential sign-up/login endpoints
- Session strategy: short-lived JWT + httpOnly refresh cookie
- Password reset via email (single-use tokens)
- Role gate middleware for `/learner/*` API routes

## Phase 3 — Content hosting

- Module content beyond text: PDF/video links or object storage (Cloudflare R2 free tier)
- Per-lesson structure under modules; attachments
- Draft/publish lifecycle for modules

## Phase 4 — Student portal UI

- `/portal` on the web app: dashboard (enrollments, progress), module player, certificates of completion
- PWA shell (offline outline caching) — site is already responsive

## Phase 5 — Payments & PECB notes

- Paystack (NG bank-friendly, no card requirement to open account) for course fees; enrollment unlock webhook
- PECB partnership: map PECB course catalogue to `Course` rows; keep artboard/credit requirements on partner pages;
  event/organic integration per PECB brand guidelines

## Ops notes

- Render (API) auto-deploys migrations on push; Neon is permanent-free.
- Keep `NEXT_PUBLIC_API_URL` pointed at the onrender.com URL; CORS allowlist lives in API env.
- Admin console is protected by `ADMIN_TOKEN` (dev fallback `dev-admin-token`) — set it in Netlify + Render.
