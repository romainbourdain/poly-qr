# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# One-shot migration runner (compose `migrate` service): needs drizzle-kit.
FROM deps AS migrator
COPY drizzle.config.ts tsconfig.json ./
COPY src/server/env-schema.ts src/server/env-schema.ts
COPY src/server/db/migrations src/server/db/migrations
COPY src/server/db/schema.ts src/server/db/schema.ts
USER node
CMD ["node_modules/.bin/drizzle-kit", "migrate"]

FROM deps AS build
COPY . .
# No secrets at build time: env validation is skipped (runtime validates).
ENV SKIP_ENV_VALIDATION=1 NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
