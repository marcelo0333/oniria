# syntax=docker/dockerfile:1
# Imagem de produção do Oniria (Next.js standalone). Targets: `migrate` (prisma migrate deploy) e `runner` (app).

FROM node:22-bookworm-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --ignore-scripts && npx prisma generate

FROM deps AS migrate
# uso: docker run --rm -e DATABASE_URL=... <image>:migrate
CMD ["npx", "prisma", "migrate", "deploy"]

FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT=standalone
# APP_URL é lido em build apenas para metadataBase/sitemap; defina no build ou use o padrão
ARG APP_URL=http://localhost:3000
ENV APP_URL=$APP_URL
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd -r app && useradd -r -g app app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
