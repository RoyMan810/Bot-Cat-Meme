FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
