# Моя котость (Telegram Tamagotchi Bot)

Production-ready scaffold of a virtual kitten care bot using **Node.js + TypeScript + Telegraf + Prisma + SQLite + Docker**.

## 1) Project Structure

```text
.
├── Dockerfile
├── docker-compose.yml
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── bot/
│   │   ├── bot.ts
│   │   ├── handlers/
│   │   │   ├── action-handler.ts
│   │   │   └── start-handler.ts
│   │   └── keyboards/
│   │       └── main-menu.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── jobs/
│   │   └── stat-decay-job.ts
│   ├── repositories/
│   │   ├── pet-repository.ts
│   │   ├── prisma.ts
│   │   └── user-repository.ts
│   ├── services/
│   │   ├── daily-service.ts
│   │   ├── pet-service.ts
│   │   └── progression-service.ts
│   └── index.ts
└── .env.example
```

## 2) Core mechanics implemented

- `/start` + inline keyboard with **"Завести питомца"**.
- Pet creation flow with kitten image + onboarding text.
- Main action menu: feed, play, sleep, clean, heal, status, daily bonus.
- Stat system: hunger, happiness, energy, health, level, age, XP.
- Economy: coins, transaction logs, daily reward + streak bonus.
- Progression: XP curve and level-up logic.
- Time mechanics: background stat decay job.
- Neglect penalty: low hunger/energy reduce health, can make pet sick.

## 3) Database schema

Defined in `prisma/schema.prisma`:
- `User`
- `Pet`
- `DailyReward`
- `Transaction`
- `PetStatus` enum

## 4) Environment variables

Copy `.env.example` → `.env` and fill in:

```bash
BOT_TOKEN=...
DATABASE_URL=file:./dev.db
PET_START_IMAGE_URL=https://...
DECAY_INTERVAL_MINUTES=30
DAILY_REWARD_COINS=50
LOG_LEVEL=info
```

## 5) Run locally

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

## 6) Run with Docker

```bash
docker compose up --build -d
```

## 7) Scaling suggestions

1. Replace SQLite with PostgreSQL (Prisma schema change + migration).
2. Add Redis for session/state cache and rate limiting.
3. Move background decay to a dedicated worker process/queue (BullMQ).
4. Add localization layer and content management for game text.
5. Introduce inventory/shop tables and premium economy safeguards.
6. Add analytics (events + funnels + cohort retention dashboard).
7. Add anti-abuse controls (cooldowns, signed callback payloads).
