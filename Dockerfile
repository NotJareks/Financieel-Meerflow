# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS build
# Prisma needs the env var to be present when loading the schema
ENV DATABASE_URL="file:./build-placeholder.db"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Sensible default; docker-compose / `docker run -e` overrides this at runtime
ENV DATABASE_URL="file:/data/app.db"

# node_modules includes devDependencies so the Prisma CLI + tsx (seed) work
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/prisma ./prisma

# Regenerate the Prisma client for the runtime (linux-musl engines)
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npx next start -H 0.0.0.0 -p 3000"]
