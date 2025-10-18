
FROM node:20-bullseye-slim AS base

ENV HOSTNAME=0.0.0.0

# ------------------------------------------------------------
# Dev image (hot reload with `npm run dev`)
# ------------------------------------------------------------
FROM base AS dev
ENV NODE_ENV=development
# Install curl (and certs), then clean APT cache
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci
# Copy the rest of the source
COPY . .
# Expose Next dev server
EXPOSE 3000

CMD ["npm", "run", "dev"]


FROM node:20-bullseye-slim AS build
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

# prod stage (no TS needed)
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm","run","start"]
