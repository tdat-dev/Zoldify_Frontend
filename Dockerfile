# Zoldify Frontend (Next.js 14) — build hai tầng, output: standalone.
#
# NEXT_PUBLIC_* được Next NHÚNG CỨNG lúc `next build`, không đọc lúc chạy, nên
# API origin phải truyền vào đây bằng build arg. Firebase thì đọc server-side
# lúc chạy (lib/firebase-config.ts) nên để runtime env, không cần ở đây.
FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_ORIGIN=https://api.zoldify.com
ENV NEXT_PUBLIC_API_ORIGIN=$NEXT_PUBLIC_API_ORIGIN
ENV NODE_OPTIONS=--max-old-space-size=1536
RUN npm run build

# Tầng chạy: chỉ gói standalone + static + public, bỏ toàn bộ node_modules dev.
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
ENV PORT=3001 HOSTNAME=0.0.0.0
EXPOSE 3001
CMD ["node", "server.js"]
