# syntax=docker/dockerfile:1
#
# Multi-stage build. The BUILD CONTEXT MUST BE THE REPOSITORY ROOT
# (pnpm-lock.yaml and pnpm-workspace.yaml live there):
#   docker build -f apps/api/Dockerfile -t cdrl-api .
#
# ── Stage 1: install the full workspace dependencies for the api package ─────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate
WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter api...
COPY apps/api ./apps/api
RUN pnpm --filter api exec prisma generate \
    && pnpm --filter api build

# ── Stage 2: runtime (non-root, healthchecked, prod NODE_ENV) ────────────────
FROM node:22-alpine AS runtime
LABEL org.opencontainers.image.title="cdrl-api"
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:4000/api/v1/health || exit 1
# NOTE: run `pnpm prisma migrate deploy` (or the compose task below) at release
# time — migrations are applied explicitly, never implicitly at boot.
CMD ["node", "apps/api/dist/index.js"]
