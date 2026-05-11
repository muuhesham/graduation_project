FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

ENV NODE_ENV=production

RUN mkdir -p uploads logs

EXPOSE 8000

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]