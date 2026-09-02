# CDRL Platform

Monorepo for the Centre for Digital Risk & Leadership website and API.

- **`apps/web`** — Next.js 15 (App Router), static/ISR marketing site, learning-plan UI
- **`apps/api`** — Express + Prisma + PostgreSQL API (`/api/v1`)
- **`docs/`** — API reference and project status notes

## Prerequisites

- Node.js ≥ 20 and **pnpm 9.15.3** (`corepack enable && corepack prepare pnpm@9.15.3 --activate`)
- Docker (for local PostgreSQL)

## Quick start (local dev)

```bash
cp .env.example .env                       # fill in your local values
docker compose up -d postgres              # database (healthchecked)
pnpm install
pnpm prisma:generate
pnpm prisma:migrate                        # applies migrations (dev)
pnpm prisma:seed                           # catalog + page content
pnpm dev:api                               # API  → http://localhost:4000
pnpm dev                                   # site → http://localhost:3000
```

## Quality gates

```bash
pnpm typecheck    # tsc --noEmit in both apps
pnpm lint         # ESLint in both apps (--max-warnings=0)
pnpm test         # unit tests (vitest)
pnpm build        # production build of both apps
pnpm audit:prod   # fail on high-severity advisories in production deps
```

CI (`.github/workflows/ci.yml`) runs all of the above plus `prisma migrate deploy` +
seed against a fresh database and a gitleaks secrets scan.

## Environments & configuration

- Real values live in **untracked** `.env` / `apps/api/.env` / `apps/web/.env.local`.
  `.env.example` files document every variable — never commit real credentials.
- The API validates configuration at boot and **fails fast** on invalid values.
- Server-side web fetches use `API_INTERNAL_URL` when set (container networks);
  the browser always uses `NEXT_PUBLIC_API_URL`.

## Production deployment (docker)

```bash
export POSTGRES_PASSWORD=... NEXT_PUBLIC_SITE_URL=https://ykayconsultinghub.com.ng \
       NEXT_PUBLIC_API_URL=https://api.ykayconsultinghub.com.ng/api/v1
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

The prod stack: postgres (internal only) → one-shot `prisma migrate deploy` →
api (healthcheck `/api/v1/health`, readiness `/api/v1/ready`, Redis-backed rate
limiting, graceful shutdown) → web (standalone Next.js server). Put a TLS
reverse proxy in front for real traffic. Always run backups before deploying
migrations (e.g. `pg_dump` via your platform).
