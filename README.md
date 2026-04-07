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
npm run prisma:push
npm run dev
```

For SQLite-based quick start, `prisma db push` creates tables directly from schema.

## 6) Run with Docker

```bash
docker compose up --build -d
```
