import { Telegraf } from 'telegraf';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { mainActionsKeyboard, startKeyboard } from '../keyboards/main-menu';
import { UserRepository } from '../../repositories/user-repository';
import { PetService } from '../../services/pet-service';

type Deps = {
  userRepo: UserRepository;
  petService: PetService;
};

export function registerStartHandler(bot: Telegraf, deps: Deps) {
  bot.start(async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = await deps.userRepo.upsertTelegramUser(
      BigInt(tgUser.id),
      tgUser.username,
      tgUser.first_name,
    );

    logger.info({ userId: user.id, telegramId: tgUser.id }, 'User started bot');

    await ctx.reply(
      `Привет, ${tgUser.first_name}! Добро пожаловать в *Моя котость* 🐾`,
      {
        parse_mode: 'Markdown',
        ...startKeyboard,
      },
    );
  });

  bot.action('pet:create', async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const user = await deps.userRepo.upsertTelegramUser(
      BigInt(tgUser.id),
      tgUser.username,
      tgUser.first_name,
    );

    await deps.petService.ensurePet(user.id);
    await ctx.answerCbQuery('Котость появилась!');

    await ctx.replyWithPhoto(env.petStartImageUrl);
    await ctx.reply(
      'Это твоя котость 🐱. Теперь ты должен заботиться о ней: кормить, играть и ухаживать.',
    );
    await ctx.reply('Выбери действие:', mainActionsKeyboard);
  });
}
