# Vercel cutover (from Netlify)

When your Netlify free credits are exhausted, this is the cheapest equivalent host.
The web app is Next.js (apps/web) — Vercel's first-class platform.

## One-time dashboard setup

1. Vercel → **Add New → Project** → import the GitHub repo `Teamthy/CDRL`.
2. Framework preset: **Next.js**.
3. **Root Directory**: `apps/web` (Vercel detects monorepo; keep it).
4. **Build Command** (if not auto-detected):  
   `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter web build`  
   — the same is in `apps/web/vercel.json` so it applies on every deploy.
5. Environment variables (Production + Preview) — **both must start with `https://`**:
   - `NEXT_PUBLIC_API_URL` = your Render API base (e.g. `https://cdrl-api.onrender.com/api/v1`)
   - same for any other `NEXT_PUBLIC_*` keys you carry on Netlify today.
6. Deploy. Default URL will be `<project>.vercel.app`.

## Custom domain cutover

1. Vercel → Project → Settings → **Domains** → add `ykayconsultinghub.com.ng` and `www…`.
2. At your registrar (Truehost or wherever DNS lives):
   - Apex: `A` record → `76.76.21.21`
   - `www`: `CNAME` → `cname.vercel-dns.com`
3. Wait for the green checks, then re-point **API CORS** if you allowlist origins:
   - Render env `CORS_ORIGIN` should include the new Vercel URL(s).

## After the cutover

- Netlify: pause builds on the old project (Project settings → Build & deploy → Stop builds) so a credit-exhausted state can't email you nightly.
- Nothing else changes: the API stays on Render, Neon stays, your push-to-deploy flow stays (push → Vercel redeploys automatically).
- The two deploy targets can coexist during migration — the site just serves whichever domain the DNS points to.

## If you hit `@types/react` missing in Next's type-check

Vercel sets `NODE_ENV=production` at INSTALL time, which makes pnpm skip
devDependencies. The shipped `apps/web/vercel.json` (patch-35) pins
`--prod=false` on install so `@types/react` and friends are present for
`next build`. Nothing else to do.
