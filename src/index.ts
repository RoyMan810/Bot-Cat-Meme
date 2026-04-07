import { createBot } from './bot/bot';
import { logger } from './config/logger';
import { prisma } from './repositories/prisma';
import { startStatDecayJob } from './jobs/stat-decay-job';

async function bootstrap() {
  await prisma.$connect();
  logger.info('Database connected');

  const bot = createBot();
  startStatDecayJob();

  await bot.launch();
  logger.info('Telegram bot launched');

  process.once('SIGINT', async () => {
    logger.info('Shutting down (SIGINT)');
    bot.stop('SIGINT');
    await prisma.$disconnect();
  });

  process.once('SIGTERM', async () => {
    logger.info('Shutting down (SIGTERM)');
    bot.stop('SIGTERM');
    await prisma.$disconnect();
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
