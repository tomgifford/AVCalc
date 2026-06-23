# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests first so Docker can cache the install layer
COPY package*.json ./
COPY app/package*.json ./app/
COPY server/package*.json ./server/

RUN npm ci

# Copy source and build both workspaces
COPY app/ ./app/
COPY server/ ./server/

RUN npm run build --workspace=app
RUN npm run build --workspace=server

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY app/package.json ./app/
COPY server/package*.json ./server/

RUN npm ci --omit=dev

# Copy compiled server and React build from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/app/dist   ./app/dist

WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
