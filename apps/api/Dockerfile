# syntax=docker/dockerfile:1
# Multi-stage build. Build context MUST be the repository root:
#   docker build -f apps/api/Dockerfile -t cdrl-api .
FROM node:22-alpine AS base
# openssl is REQUIRED by the Prisma query engine on Alpine (musl).
RUN apk add --no-cache openssl \
 && corepack enable && corepack prepare pnpm@9.15.3 --activate
WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter api...
COPY apps/api ./apps/api
RUN pnpm --filter api exec prisma generate \
 && pnpm --filter api build

FROM node:22-alpine AS runtime
LABEL org.opencontainers.image.title="cdrl-api"
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
# Startup script for hosts (e.g. Render) whose command field cannot run shell
# chains; it runs migrations then execs the API. Must stay executable, and
# verify paths before shipping: the runtime stage copies all of /app, so a bad
# path here only fails at container start, not at build time.
RUN chmod +x apps/api/docker-start.sh \
 && test -f apps/api/node_modules/.bin/prisma \
 && test -f apps/api/dist/index.js
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://127.0.0.1:4000/api/v1/health || exit 1
CMD ["/app/apps/api/docker-start.sh"]
