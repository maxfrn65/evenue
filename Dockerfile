# =========================================================
# Stage 1: Base Dependencies & Prisma Client Generator
# =========================================================
FROM node:22-alpine AS deps
WORKDIR /app

# Install openssl for Prisma binaries
RUN apk add --no-co-cache openssl libc6-compat

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# =========================================================
# Stage 2: Application Builder
# =========================================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build

# =========================================================
# Stage 3: Lightweight Production Runner
# =========================================================
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-co-cache openssl curl

ENV NODE_ENV=production
ENV PORT=5173
ENV HOST=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5173/api/health || exit 1

CMD ["node", "build/index.js"]
