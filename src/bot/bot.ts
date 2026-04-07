import { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { registerStartHandler } from './handlers/start-handler';
import { registerActionHandler } from './handlers/action-handler';
import { UserRepository } from '../repositories/user-repository';
import { PetService } from '../services/pet-service';
import { DailyService } from '../services/daily-service';
import { CooldownService } from '../services/cooldown-service';

export function createBot() {
  const bot = new Telegraf(env.botToken);
  const userRepo = new UserRepository();
  const petService = new PetService();
  const dailyService = new DailyService();
  const cooldownService = new CooldownService(env.actionCooldownSeconds);

  registerStartHandler(bot, { userRepo, petService });
  registerActionHandler(bot, { userRepo, petService, dailyService, cooldownService });

  bot.catch((err) => logger.error({ err }, 'Bot runtime error'));
  return bot;
}
