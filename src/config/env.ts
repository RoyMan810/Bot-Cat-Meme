import dotenv from 'dotenv';

dotenv.config();

const required = ['BOT_TOKEN', 'DATABASE_URL'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  botToken: process.env.BOT_TOKEN as string,
  databaseUrl: process.env.DATABASE_URL as string,
  petStartImageUrl:
    process.env.PET_START_IMAGE_URL ??
    process.env.PET_START_IMAGE_UR ??
    'https://images.unsplash.com/photo-1519052537078-e6302a4968d4',
  decayIntervalMinutes: Number(process.env.DECAY_INTERVAL_MINUTES ?? 30),
  dailyRewardCoins: Number(process.env.DAILY_REWARD_COINS ?? 50),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  actionCooldownSeconds: Number(process.env.ACTION_COOLDOWN_SECONDS ?? 15),
};
