# ---- Build stage ----
# Native modules (bcrypt, sqlite3) need build tools to compile.
FROM node:20-alpine AS builder

WORKDIR /app

# Tools required to compile native node addons on Alpine (musl).
RUN apk add --no-cache python3 make g++

# Install deps first for better layer caching.
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runtime stage ----
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# Copy compiled node_modules from the build stage.
COPY --from=builder /app/node_modules ./node_modules

# Copy application source.
COPY . .

# Run as the built-in non-root user for security.
USER node

EXPOSE 3000

CMD ["node", "index.js"]
