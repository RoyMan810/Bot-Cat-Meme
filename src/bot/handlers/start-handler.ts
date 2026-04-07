import { Input, Telegraf } from 'telegraf';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { mainActionsKeyboard, startKeyboard } from '../keyboards/main-menu';
import { UserRepository } from '../../repositories/user-repository';
import { PetService } from '../../services/pet-service';
import { editOrReplyText } from '../utils/message-editor';

type Deps = {
  userRepo: UserRepository;
  petService: PetService;
};

export function registerStartHandler(bot: Telegraf, deps: Deps) {
  bot.start(async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    await deps.userRepo.upsertTelegramUser(
      BigInt(tgUser.id),
      tgUser.username,
      tgUser.first_name,
    );

    const user = await deps.userRepo.getByTelegramId(BigInt(tgUser.id));
    if (!user) return;

    logger.info({ userId: user.id, telegramId: tgUser.id }, 'User started bot');

    if (user.pet) {
      await editOrReplyText(
        ctx,
        `С возвращением, ${tgUser.first_name}! Твоя котость уже ждёт тебя 🐱`,
        { reply_markup: mainActionsKeyboard.reply_markup },
      );
      return;
    }

    await editOrReplyText(
      ctx,
      `Привет, ${tgUser.first_name}! Добро пожаловать в *Моя котость* 🐾`,
      startKeyboard,
      true,
    );
  });

  bot.action('pet:create', async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    await deps.userRepo.upsertTelegramUser(
      BigInt(tgUser.id),
      tgUser.username,
      tgUser.first_name,
    );
    const user = await deps.userRepo.getByTelegramId(BigInt(tgUser.id));
    if (!user) return;

    if (user.pet) {
      await ctx.answerCbQuery('Питомец уже создан');
      await editOrReplyText(ctx, 'У тебя уже есть котость 🐱', mainActionsKeyboard);
      return;
    }

    await deps.petService.ensurePet(user.id);
    await ctx.answerCbQuery('Котость появилась!');

    if ('callback_query' in ctx.update) {
      await ctx.editMessageMedia(
        {
          type: 'photo',
          media: Input.fromURL(env.petStartImageUrl),
          caption:
            'Это твоя котость 🐱. Теперь ты должен заботиться о ней: кормить, играть и ухаживать.',
        },
        { reply_markup: mainActionsKeyboard.reply_markup },
      );
      return;
    }

    await ctx.replyWithPhoto(env.petStartImageUrl, {
      caption:
        'Это твоя котость 🐱. Теперь ты должен заботиться о ней: кормить, играть и ухаживать.',
      reply_markup: mainActionsKeyboard.reply_markup,
    });
  });
}
