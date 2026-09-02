# CDRL Platform

This monorepo contains a Next.js frontend and a Node.js/TypeScript API for the CDRL experience.

## Development

1. Install dependencies: `pnpm install`
2. Start PostgreSQL: `docker compose up -d postgres`
3. Run database migrations: `pnpm prisma:migrate`
4. Seed data: `pnpm prisma:seed`
5. Start apps: `pnpm dev`

## Production build

- `pnpm build`
