# CDRL Frontend Project Status

_Reviewed 2026-10-08 against `main`, after the audit remediation pass. Findings and their status are tracked in [AUDIT_2026-10-08.md](AUDIT_2026-10-08.md)._

## 1. What it is

The public website and the learner and admin portals for the CDRL / YKAY Consulting Hub, in `apps/web`. The site presents the training catalogue, PECB certification and ISO training pages, events and news, and the enquiry and application forms. Learners sign in to see their enrolments and modules. Staff use the admin console.

## 2. Stack

- Next.js 15.5 with the App Router, React 18.3, TypeScript.
- framer-motion for reveal animations, lucide-react for icons, zod for response checks.
- Fonts come from `next/font/google`, so the build needs outbound access to Google Fonts.
- Vitest for unit tests. Run them with `TZ=UTC`: `lib/dates.test.ts` pins Africa/Lagos.

## 3. What is built

### Public site

- Home, about, advisory, partnerships, research, privacy, terms, accessibility, the Nigeria data-protection page, and an offline page.
- Training: the catalogue (`/training`), course pages (`/training/[slug]`), pricing, corporate training, and bundles (`/bundles`, `/bundles/[slug]`).
- Local-market pages: PECB certification and training in Nigeria, ISO training in Nigeria, and the PECB partnership announcement.
- Events (`/events`), news (`/news`, `/news/[slug]`), and the learning plan (`/learning-plan`).
- Contact (`/contact`): the contact form, which prefills from `?interest=`, and the phone line. The number is defined once, in `lib/siteContact.ts`. It opens a WhatsApp chat, with a separate call link beside it. The footer and the contact page use the generic greeting.
- Course pages: an action panel (links to brochures, upcoming events and an apply call-to-action), and an enrolment card with an "Ask on WhatsApp" link prefilled with the course name, the apply form and the pay card. Every course page ends with a waitlist strip. Event and exam cards on `/events` have the same kind of link, prefilled with the event title.
- Course data comes from the API. If the API is unavailable, the pages fall back to the local content in `lib/content.ts`.

### Learner portal

- Sign-in (`/sign-in`), sign-up (not for accounts an admin created: those use an invite link), forgot and reset password, onboarding (`/learner/onboarding`), the dashboard (`/learner`), the course player and module completion (`/learner/[slug]`), and the certificate page (`/learner/[slug]/certificate`).
- The access token is kept in `localStorage`. The refresh token is an httpOnly cookie that the app uses to renew the session.

### Admin console (`/admin/*`)

- Sign-in, then guarded pages for the overview, activity (audit log), courses, events, posts, bundles, enquiries, applications, LMS (users, with an invite link for anyone who has no password; enrolments; modules; recordings), and PECB exam sessions.
- The resource editor autosaves drafts to `localStorage`.

### Cross-cutting

- One contact button per page. `lib/pageCta.ts` enforces this. The footer's call-to-action is skipped when the page already has one.
- JSON-LD for the organisation and for courses (`lib/jsonld.ts`). The organisation's `telephone` is the E.164 number, never a WhatsApp link.
- The Content Security Policy is built per request in `middleware.ts` (`lib/csp.ts`). It is nonce-based and report-only, with `img-src 'self' data: blob:`. `connect-src` covers the site and the API origin, and the analytics hosts only when `NEXT_PUBLIC_GA_ID` is set.

## 4. Tests and checks

- `TZ=UTC pnpm --filter web test`: 13 files, 100 tests.
- `pnpm --filter web exec tsc --noEmit` and `pnpm --filter web lint` (with `--max-warnings=0`).
- `pnpm --filter web build` needs network access to Google Fonts.
- A local preview runs with `pnpm --filter web exec next dev -H 0.0.0.0 -p 3000`. Course pages render without the API, because of the local fallback. Events and the admin console need it.

## 5. Known gaps and open decisions

- **CSP is report-only.** The policy is nonce-based and has no `'unsafe-inline'` for scripts. Per-request nonces make every page render per request, so pages are no longer served from the static cache; that was agreed in review. Enforcing it needs a review of the reports in a real browser. The policy has no `report-uri` or `report-to`, so violations show only in the browser console, and nothing collects them yet. A report endpoint would make the review practical. The employer-letter print helper must be fixed first, because its inline script would likely be blocked.
- **Access tokens are kept in `localStorage`** (`lib/learnerClient.ts`, `lib/adminClient.ts`). The decided fix is httpOnly cookies. Same-site hosting makes that possible, but the API must move to a subdomain first (see the backend status doc).
- **Employer-letter print** (`components/course/EmployerFunding.tsx`): `window.open(..., 'noopener')` returns `null` in current browsers, so the print helper appears to do nothing. It needs a browser check.
- **No end-to-end tests.** The unit tests cover the client libraries and some pure logic. Nothing drives a browser through enrolment, enquiry, invite or sign-in.
- **Dependency advisories** come through `next@15.5.21`, along with `postcss` and `sharp` underneath it. Next 15.5.27 is the first release that fixes the Next advisories. The upgrade belongs in its own PR.

## 6. Next steps

1. Check the employer-letter print helper in a browser, and fix it.
2. Review the CSP reports in a real browser, then switch the header to enforcement.
3. Move the access tokens to cookies, once the API is on the same site.
4. Add a small browser test covering the enquiry forms, the invite link and sign-in.
