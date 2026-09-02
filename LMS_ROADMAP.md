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

## Phase 2 — Learner authentication (DONE, patch-18)

- `passwordHash` (bcryptjs — already a dependency; swap to argon2 later if policy demands) on `LmsUser`
- Endpoints on `/api/v1/learner`: `POST /signup` (also claims admin-created accounts), `POST /login`,
  `GET /me` (profile + enrollments), `POST /forgot-password`, `POST /reset-password`
- Session: 12h JWT in localStorage (console parity); refresh-cookie rotation deferred to hardening phase
- Password reset: **single-use JWT fingerprinted to the current password hash** — expires 30 min, dies on use, no DB table
- Email enumeration impossible (uniform 200s); suspended users blocked at login and `/me`
- Web: `/sign-in` (sign in / create account / forgot / reset) + `/learner` dashboard (enrollments + progress); both noindexed
- Config: set `LEARNER_JWT_SECRET` (32+ chars) in Render; `PUBLIC_WEB_URL` optional for reset links

## Phase 3 — Content delivery (PARTIAL, patch-19)

- ✅ Per-module text content (`CourseModule.body`) rendered to enrolled learners
- ✅ Draft/publish lifecycle for modules (`published` flag; admin edit/delete/publish in console → LMS → Modules)
- ✅ Learner module viewer: `/learner/<course-slug>` (ordered, expandable; enrollment-gated on the API)
- ✅ Rich module bodies (patch-21): `##`/`###` headings, `-` bullets, `**bold**`, `[links](https://…)`, bare YouTube URL → responsive embed (no raw HTML, React-escaped; parser covered by unit tests)
- ⏭ Deferred: file attachments (PDFs) — Cloudflare R2 free tier when needed

## Phase 4 — Student portal UI (MOSTLY DONE, patch-18/19/21)

- ✅ `/learner` dashboard (enrollments, progress bars, tutor) + `/learner/<slug>` module list
- ✅ Certificates: `/learner/<slug>/certificate` — printable, verification ID, print-to-PDF; unlocks when enrollment = completed (patch-21)
- ✅ Session recordings area (patch-22): console → LMS → Recordings; enrollment-gated in the player; YouTube embeds vs link cards
- ⏭ Remaining: PWA offline caching
- ✅ RBAC (patch-23): one permission matrix + authenticate()/requirePermission(); JWTs carry iss/aud so
  admin and learner tokens are mutually unreplayable; roles read from DB per-request; tutor grading
  surface (own enrollments only, ownership enforced in the query itself); 401 vs 403 discipline
- ✅ Refresh-cookie rotation (patch-25): 2h access JWT + 30d rotating httpOnly cookie, family model,
  reuse-revokes-family, Origin allowlist CSRF shield, logout/password-reset revoke sessions
- ✅ PWA offline (patch-25): manifest + conservative service worker (auth/data routes never cached)
- Hardening backlog: argon2 policy review

## Phase 5 — Payments & PECB notes (PARTIAL, patch-20)

- ✅ `Course.priceKobo`/`currency` (console Courses editor: "Price (₦)" — blank keeps apply-only flow)
- ✅ `Purchase` model + `/api/v1/payments`: `POST /initialize` (Paystack hosted checkout link), `GET /verify/:reference`, raw-body HMAC webhook (`/api/v1/payments/webhook`)
- ✅ Successful payment auto-enrolls (upserts learner by email; repeat purchase = benign no-op)
- ✅ Course pages show a **Pay & Enroll** card whenever a price is set; `/pay/callback` verifies and deep-links into the portal
- **Dormant until configured:** Render env `PAYSTACK_SECRET_KEY` (paystack.com — free account, no card needed).
  Set the Paystack dashboard webhook URL to `https://<api>/api/v1/payments/webhook`. Prices are set per course in the console first.
- ✅ Trademark credit lines on homepage PECB band + site-wide footer (patch-24)
- ✅ Catalogue mapping (patch-26): seed.ts now carries the flagship PECB portfolio (11 added rows + PECB-marked
  existing titles); /partnerships renders a portfolio grid for any course whose subtitle mentions PECB;
  the /training marketplace filter chips group them by track. Grow the catalogue in the console — subtitle must
  contain "PECB" to surface in the portfolio grid; re-running the seed is safe (upserts by slug).

## Ops notes

- Render (API) auto-deploys migrations on push; Neon is permanent-free.
- Keep `NEXT_PUBLIC_API_URL` pointed at the onrender.com URL; CORS allowlist lives in API env.
- Admin console is protected by `ADMIN_TOKEN` (dev fallback `dev-admin-token`) — set it in Netlify + Render.

## Seeding the database

`apps/api/src/seed.ts` upserts the 14 catalogue courses (by slug) plus all page
content blocks — idempotent, safe to re-run. It requires `DATABASE_URL`:

```bash
cd apps/api
DATABASE_URL="<your Neon string>" pnpm prisma:seed
```

Run once after the patch-15 migration so LMS enrollments can resolve course slugs.

## Patch-27 — Full PECB course catalogue with rich detail pages (2026-09-02)

- ✅ **Full PECB catalogue seeded**: `apps/api/src/pecb-catalogue.ts` enumerates the PECB
  education portfolio across all 11 PECB categories (Information Security, Cybersecurity
  Management, Technical Cybersecurity, Continuity & Resilience, Privacy & Data Protection,
  Artificial Intelligence, Digital Transformation, GRC, Quality & Management, Health & Safety,
  Sustainability). Rows upsert by slug — re-running the seed is always safe.
- ✅ **Well-detailed course pages**: new `Course.details` long-form field (markdown-lite),
  rendered on every `/training/<slug>` page by the existing `ModuleText` component with
  About / Who should attend / What you will learn / Examination and certification sections.
- ✅ **Console editor**: courses in the admin console now expose the long-form details field.
- ✅ Tracks follow PECB's own category names, so the /training filter chips mirror their site.
- Ops docs: press-release email + partner exam-credit request templates ship in
  `docs/PECB_OPS_PACK.md`.
