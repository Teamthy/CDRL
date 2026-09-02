#!/bin/sh
# Startup for container hosts (Render etc.). Runs DB migrations, then starts the API.
# Kept as an in-image script because Render's "Docker Command" field cannot run shell chains.
set -e
cd "$(dirname "$0")"
echo "[docker-start] Running prisma migrate deploy..."
./node_modules/.bin/prisma migrate deploy
echo "[docker-start] Migrations OK. Starting API..."
exec node dist/index.js
