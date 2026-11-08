# syntax=docker/dockerfile:1.7
# -----------------------------------------------------------------------------
# Unique Labs website — production image
#
#   docker build -t uniquelabs-web .
#   docker run -p 3000:3000 --env-file .env.production uniquelabs-web
#
# Stages:
#   deps      install all dependencies (cached on package-lock.json)
#   builder   generate the Prisma client and build the Next.js standalone app
#   migrator  a tiny, isolated Prisma CLI used to apply migrations at start-up
#   runner    minimal runtime image, non-root user
# -----------------------------------------------------------------------------
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Placeholder used only while installing/building: `prisma generate` reads the
# config but never connects. The build itself needs no database.
FROM base AS deps
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

FROM base AS builder
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM base AS migrator
WORKDIR /migrator
RUN npm init -y >/dev/null 2>&1 \
  && npm install --no-audit --no-fund --omit=dev prisma@7.10.1 dotenv@18.0.9
COPY prisma ./prisma
COPY docker/prisma.config.ts ./prisma.config.ts

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# The standalone output already contains public/ and .next/static (postbuild).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=migrator --chown=nextjs:nodejs /migrator ./migrator
COPY --chown=nextjs:nodejs docker/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh && mkdir -p /app/storage && chown nextjs:nodejs /app/storage
USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
