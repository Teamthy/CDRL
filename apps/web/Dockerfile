# syntax=docker/dockerfile:1
#
# Multi-stage build. The BUILD CONTEXT MUST BE THE REPOSITORY ROOT:
#   docker build -f apps/web/Dockerfile -t cdrl-web \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 .
#
# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time —
# they must be supplied as build args, not just runtime env.
#
# ── Stage 1: build the standalone Next.js server ─────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.3 --activate
WORKDIR /app

FROM base AS build
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter web...
COPY apps/web ./apps/web
RUN pnpm --filter web build

# ── Stage 2: runtime — standalone server only ────────────────────────────────
FROM node:22-alpine AS runtime
LABEL org.opencontainers.image.title="cdrl-web"
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/ || exit 1
CMD ["node", "apps/web/server.js"]
