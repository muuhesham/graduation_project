# Stage 1: Build dependencies
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install system dependencies for Prisma/Openssl
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy only package.json first to optimize layer caching
COPY package.json ./

# Install dependencies (ignoring broken package-lock if necessary to avoid 'extraneous' bug)
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Stage 2: Production image
FROM node:22-bookworm-slim

WORKDIR /app

# Install production runtime dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl wget \
    && rm -rf /var/lib/apt/lists/*

# Copy built node_modules and prisma client from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Copy source code
COPY . .

# Ensure production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create necessary directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 3000

# Entrypoint script to handle migrations/seeds
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && npm run prisma:seed && node src/server.js"]
