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


## Patch-28 — Console: PECB exam & credit request composer (2026-09-02)

- ✅ New console section **PECB Exams** (`/admin/pecb-exams`, nav: "PECB Exams"):
  - **Exam provisioning** composer: pick any PECB-coded course, enter cohort dates,
    trainer, delivery mode, exam window/format, paste candidates (`name, email` per
    line) → generates the PECB-format request email with copy + `mailto:` actions.
  - **Credit purchase** composer for partner exam-credit top-ups.
  - Pre-send checklist surfacing PECB's rules (attendance recorded, candidate emails
    match PECB profiles, credit balance/PO cover, exam-rules briefing).
- ✅ No backend surface added — client-side only; templates mirror `docs/PECB_OPS_PACK.md`.

## Patch-29 — Complete PECB catalogue gap closure (2026-09-02)

- ✅ Catalogue enumerated from the live PECB sitemap (116 course rows across the 11
  categories; every family in PECB's education catalogue now has all its credential
  levels: Foundation / Manager / Lead Implementer / Lead Auditor / Transition).
- ✅ New families added: ISO/IEC 27034 (AppSec), ISO/IEC 27400 (IoT), NIST CSF, SOC 2,
  ISO 13485, ISO 21001, ISO 37000, ISO 56001, Advanced Pen Tester, Crisis Manager,
  US Data Privacy, Lean Six Sigma YB, CMSA auditor credential, DORA Foundation, and
  the missing Transition/level variants across ISO 27002/27005/14001/50001/22000/
  17025/21502/28000/55001/45001/18788/27701/31000/37001/37301/26000.
- ✅ Seed upsert-by-slug keeps re-runs safe; EU AI Governance + ISO/TS 31050 remain
  excluded (PECB marks them "coming soon").


## Patch-30 — UI polish: catalogue filters, form placeholders, course imagery, bug fix (2026-09-02)

- ✅ **Bug fix — `e.filter is not a function`**: `/admin/courses` is paginated
  (`{items, total}`) but the PECB Exams composer read it as a bare array. Now
  tolerates both shapes and bumps the fetch limit to 200.
- ✅ **Dynamic catalogue filters**: /training chips are now derived from the live
  course list instead of a hardcoded 5-entry list, so all 11 PECB categories +
  curated tracks appear with course counts, auto-growing as the catalogue grows.
- ✅ **Course imagery**: every course card and course-detail hero gets a
  Unsplash-served thematic backdrop chosen deterministically per track
  (lib/courseImages.ts — every URL verified working on 2026-09-02); dark gradient
  overlay preserves text readability, hover zoom adds motion.
- ✅ **Form polish**: contextual placeholders across Apply card, Pay card, and
  contact enquiry; consistent focus ring (accent halo), rounded corners, and a
  custom chevron on all dropdowns across public + console surfaces.

## Patch-31 — PECB-parity course pages & sales surfaces (2026-09-02)

- ✅ **Course detail redesign (PECB-parity)**: sticky in-page table of contents,
  sibling "credential level" ladder (Foundation/LI/LA/Transition per family),
  PECB-style action strip (View brochures / View all training events / Get
  started / partner note), Career outcomes section, waitlist notifier, and an
  employer funding letter builder (name/employer/role → personalized letter,
  download as .txt or print-to-PDF).
- ✅ **Pagination** on /training (24 per page, page numbers, prev/next).
- ✅ **Auto-scrolling "Related programmes" rail** on course pages — same family
  first, then same track; pause-on-hover + manual controls.
- ✅ **Corporate quote form** on /corporate-training (posts to the CRM).


## Patch-32 — Console brand consistency + robustness (2026-09-02)

- ✅ **Shared form toolkit expanded** (`components/admin/fields.tsx`): Select dropdown
  (style-aligned), hint text under fields, Field hint/error shelf, TextInput hint prop.
- ✅ **Courses editor**: Track/Level/Delivery mode become dropdowns of canonical
  choices (PECB categories, level ladder, delivery modes); placeholders + hints
  across every input; markdown-lite help on the long-form details box.
- ✅ **ResourceManager robustness**: in-table text filter with typeahead search
  input; `total` items count in the header; notices self-dismiss after 4.5s;
  Escape closes the editor; unsaved-draft confirmation guard before closing;
  double-click delete already guarded by arm/confirm.

## Patch-33 — PECB parity depth: trainers, bundles, exam events, ROI pricing (2026-09-02)

- ✅ **Trainer model + pages** (`/trainers`, `/trainers/[slug]`) — published in console,
  with per-person courses-taught sub-pages. Demo seed row included (editable).
- ✅ **Bundle model + pages** (`/bundles`, `/bundles/[slug]`) with course membership
  picker, group pricing field, savings note, and per-course pathway indexes. Demo
  bundle (Security Foundations Pathway) seeded with three starter courses.
- ✅ **Event.type** (`cohort | exam | webinar | briefing`): Events page splits exam
  sessions into a dedicated "Exam sessions" strip with PECB exam-rules wording
  (online-proctored, retake policy, rules link).
- ✅ **Course `priceBand`** (JSON: individual/corporate/bundle copy) renders as an
  "Investment — three ways" card on course pages; console editor added.
- ✅ Admin client: AdminCourse/AdminEvent extended with the new fields.

## Patch-34 — Console robustness round (2026-09-02)

- ✅ **Draft autosave**: every editor panel snapshots to localStorage on change;
  after a reload it offers "Restore draft" so in-progress work survives crashes.
- ✅ **Audit log**: new `AuditLog` table + `GET /admin/audit-log`; console mutations
  (create/update/delete in the ResourceManager + patch-31–33 CRUD) all record
  actor/action/summary; new **Activity** console page with filter + refresh.
- ✅ **Bulk publish/unpublish** on the Courses manager (row checkboxes → action bar).
- ✅ **Slug availability pre-check** on the courses editor (green ✓ / red ✗ under the
  slug input, debounced 350 ms against the live list).
- ✅ **Preview button** on the courses editor (opens the live `/training/<slug>`
  page in a new tab before or after save).
- ✅ **Vercel migration buddy**: `apps/web/vercel.json` + `docs/DEPLOY_VERCEL.md` —
  click-through cutover steps when Netlify free credits exhaust (app is already
  Vercel-native; no code change, just root-directory + env copy).

## Patch-36 — PECB-parity surfaces /training & /courses (2026-09-02)

- ✅ **Training listing redesign**: new CategoryLaunchpad (hero tiles per catalogue track,
  image-backed, click-to-filter & scroll to the marketplace) above the filter bar;
  industry-standard numbered pagination with ‹ › ellipsis window; full-width catalogue
  anchors.
- ✅ **Course-detail hero redesign**: breadcrumbs (Home / Training / Course), PECB-style
  headline and eyebrow, "Apply for this training" + "Back to all programmes" CTAs.
- ✅ **Per-course imagery**: slug-keyword overrides route standard families to the
  best-fitting verified Unsplash backdrops (ISO 27001 → padlock, 42001 → neural glow,
  ethical hacking → hoodie matrix, GDPR → privacy lock, QA → measurement bench, …),
  falling back to per-track themes. All URLs re-verified live 2026-09-02.
- ✅ **Course bodies restructured to PECB section order** in the seed: What is X? · Why
  it matters · Who should attend · What you will learn · How to get started · Exam &
  certification. URLs and page structure unchanged (pure content rewrite via seed
  re-run).

## Patch-37 — 4×4 grid, guaranteed-rich course bodies, contrast lock (2026-09-02)

- ✅ Catalogue pagination is now 4 × 4 (PAGE_SIZE 16); grid is 4 columns ≥1180px.
- ✅ `lib/courseDetails.ts` — `richDetailsFor()` ensures EVERY course page shows the
  full PECB section set (What is / Why important / Who should attend / What you will
  learn / How to get started / Exam & certification) even for rows seeded before
  patch-36 (synthesizes missing bodies at render time; once you re-run `prisma:seed`,
  stored PECB bodies take over automatically).
- ✅ `levelMetaFor()` — level-accurate programme facts: 2-day/1-hr exam/14 CPD
  (Foundation/Transition/Executive), 3-day/2-hr/21 CPD (Professional), 5-day/3-hr/
  35 CPD (Advanced).
- ✅ Course detail now opens with a 4-cell facts band beneath the hero (duration,
  exam, CPD credits, materials included) — matches PECB's "what you get" at-a-glance.
- ✅ Contrast lock: heavy dark scrim over every image hero and tile; text forced to
  light tokens there, dark tokens on light surfaces — no light-on-light anywhere.
- ✅ TOC and body share the same source (`richDetailsFor`), so anchors can never drift.

## Patch-44 — Learner self-service profile, progress & sessions (2026-09-02)

### API
- ✅ **`POST /learner/courses/:slug/modules/:moduleId/complete`** — enrolled learners
  mark modules done themselves; progress recomputes from `ModuleCompletion` rows and
  auto-flips the enrollment to `completed` at 100%
- ✅ **`PATCH /learner/me`** — rename profile (email change stays admin-only by design)
- ✅ **`POST /learner/me/change-password`** — verifies current password, rotates all
  refresh tokens server-side, keeps the current session alive
- ✅ Prisma `ModuleCompletion` model + migration `20260902160000_module_completions`
  (unique(studentId,moduleId), cascade on student/course)
- ✅ `/courses/:slug/modules` now returns `completedModuleIds` for resume-anywhere

### Web
- ✅ New Profile card on My Learning: rename inline, change-password accordion
- ✅ Course player gains per-module tick control (circle → green check) with live
  progress bar updates
- ✅ `learnerClient` gets `learnerUpdateName`, `learnerChangePassword`,
  `learnerMarkModuleComplete`

Auth stack pre-existed (12h access token in localStorage + rotating HttpOnly refresh
cookie with reuse-detection) — this fills the comprehension/profile gap.

## Patch-46 — Admission pipeline, robust activity, learner onboarding (2026-09-02)

### Admin — admission (the missing piece)
- ✅ **`POST /admin/applications/:id/admit`** — one action admitting an application:
  find-or-create the LmsUser (passwordless claim flow), create the Enrollment (active,
  0% progress), flip the application to `enrolled`, and write an audit-log line
- ✅ Applications detail drawer gains a green **Admit & enroll** button next to Save
  (visible when a course is attached and not yet enrolled); double-click guarded

### Admin — Activity page
- ✅ **Action-type chips** (All/Create/Update/Delete) with live counts stacked with
  the text search, so you can filter on either or both axes
- ✅ Empty state uses the shared EmptyArt illustration
- ✅ Recent-events text-search and refresh pattern kept (same API)

### Learner — onboarding
- ✅ **First-run onboarding flow** at `/learner/onboarding` — 3-step carousel (account
  live → how modules work → how to reach admissions), step dots, "Finish — open my
  dashboard" CTA, marks the server-side `onboardedAt` flag
- ✅ Learner dashboard redirects first-timers to onboarding; onboarding page redirects
  returners back to dashboard
- ✅ Prisma `LmsUser.onboardedAt` + migration `20260902170000_learner_onboarding`

### Contrast sweep
- ✅ auth/learner surfaces pinned dark (`.auth-card`, `.auth-sub`, learn-list cards)
- ✅ `.admin-mailto`, `.admin-detail-meta`, `.status-pill` pinned

## Patch 49 — SEO foundation (structured data + PECB keywords)
- ✅ JSON-LD structured data: `EducationalOrganization` + `WebSite` site-wide (layout),
  `Course` schema on every `/training/[slug]` page (with NGN offer when priced),
  `NewsArticle` on `/news/[slug]` and the PECB press release
- ✅ Homepage metadata targets "PECB, Cybersecurity & AI Governance Training in Nigeria"
- ✅ PECB course pages: meta description names the PECB partnership; internal-link
  strip → press release + `/partnerships` portfolio (crawl paths for PECB queries)
- ✅ No CSS / DB / API changes — render-layer only

## Patch 50 — SEO push to 100 (pillar + schema + analytics)
- ✅ NEW pillar page `/pecb-training-nigeria`: PECB Training in Nigeria — flagship families,
  full catalogue (live API grouping), how-it-works, 5-question FAQ + FAQPage JSON-LD
- ✅ Breadcrumbs (visible + BreadcrumbList JSON-LD) on course pages
- ✅ Event JSON-LD on /events (renders only when published events exist)
- ✅ Person JSON-LD on trainer pages (real fields only; sameAs only for full LinkedIn URLs)
- ✅ GA4 Analytics component (env-gated on NEXT_PUBLIC_GA_ID — inert until set)
- ✅ Retitles: /training, /partnerships, /corporate-training
- ✅ Internal links: homepage + press release + course pages → pillar
- ✅ Sitemap gains /pecb-training-nigeria

## Patch 51 — publish SEO guides (data migration + linkified news renderer)
- ✅ Migration `20260904120000_publish_seo_guides`: 5 published Guides posts
  (PECB certification, ISO 27001, ISO 42001/AI governance, ISO 22301/BC,
  cybersecurity paths) — idempotent ON CONFLICT (slug) DO NOTHING
- ✅ /news/[slug] renderer turns bare URLs in post bodies into links
  (internal same-tab, external new-tab noopener)

## Patch 52 — sitemap ISR
- ✅ sitemap.ts exports revalidate = 3600 — newly published posts/courses now
  enter the sitemap within an hour of publishing (no redeploy needed);
  previously the sitemap was baked at build time only
