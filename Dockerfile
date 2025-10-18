# ------------------------------------------------------------
# Base image (pick ONE of these)
# ------------------------------------------------------------
# Option A: Smallest image; works for most apps (add libc6-compat for Next/sharp)
FROM node:20-bullseye-slim AS base

# Option B (uncomment to use): slightly larger, best compatibility for native deps
# FROM node:20-slim AS base

WORKDIR /app 
ENV NODE_ENV=production
# Next.js needs this when running in Docker
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

# ------------------------------------------------------------
# Build image (creates the optimized .next output)
# ------------------------------------------------------------
FROM base AS build
# Install deps (exact versions)
COPY package*.json ./
RUN npm ci
# Copy source and build
COPY . .
# You can pass build-time envs using --build-arg if needed:
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build


# --- runtime stage ---
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production
# system deps your app needs (you already add gcompat)
RUN apk add --no-cache libc6-compat

# install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# copy the compiled app from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.* ./   # if needed at runtime
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

EXPOSE 3000
CMD ["npm","run","start"]


