#!/bin/sh
# Container entrypoint: apply pending database migrations, then start the app.
# Set RUN_MIGRATIONS=false to manage migrations separately (e.g. multiple replicas).
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Applying database migrations…"
  (cd /app/migrator && ./node_modules/.bin/prisma migrate deploy)
fi

echo "[entrypoint] Starting Unique Labs on port ${PORT:-3000}"
exec node /app/server.js
