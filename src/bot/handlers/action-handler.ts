import { Telegraf } from 'telegraf';
import { logger } from '../../config/logger';
import { mainActionsKeyboard } from '../keyboards/main-menu';
import { UserRepository } from '../../repositories/user-repository';
import { PetService } from '../../services/pet-service';
import { DailyService } from '../../services/daily-service';

type Deps = {
  userRepo: UserRepository;
  petService: PetService;
  dailyService: DailyService;
};

export function registerActionHandler(bot: Telegraf, deps: Deps) {
  bot.action(/action:.+/, async (ctx) => {
    const tgUser = ctx.from;
    if (!tgUser) return;

    const action = ctx.match[0].split(':')[1];
    const user = await deps.userRepo.getByTelegramId(BigInt(tgUser.id));
    if (!user) {
      await ctx.answerCbQuery('Сначала нажми /start');
      return;
    }

    try {
      switch (action) {
        case 'feed': {
          const result = await deps.petService.feed(user.id);
          await ctx.answerCbQuery('Котость накормлена!');
          await ctx.reply(
            `🍗 Сытость повышена, +${result.gainedXp} XP, +${result.gainedCoins} монет.`,
            mainActionsKeyboard,
          );
          break;
        }
        case 'play': {
          const result = await deps.petService.play(user.id);
          await ctx.answerCbQuery('Вы отлично поиграли!');
          await ctx.reply(
            `🎮 Счастье +, энергия -, +${result.gainedXp} XP, +${result.gainedCoins} монет.`,
            mainActionsKeyboard,
          );
          break;
        }
        case 'sleep': {
          await deps.petService.sleep(user.id);
          await ctx.answerCbQuery('Питомец отдыхает 😴');
          await ctx.reply('⚡ Энергия восстановлена.', mainActionsKeyboard);
          break;
        }
        case 'clean': {
          await deps.petService.clean(user.id);
          await ctx.answerCbQuery('Питомец чист и доволен ✨');
          await ctx.reply('🧼 Чистота улучшила здоровье и настроение.', mainActionsKeyboard);
          break;
        }
        case 'heal': {
          await deps.petService.heal(user.id);
          await ctx.answerCbQuery('Лечение выполнено 💊');
          await ctx.reply('❤️ Здоровье улучшено (-30 монет).', mainActionsKeyboard);
          break;
        }
        case 'daily': {
          const reward = await deps.dailyService.claimDaily(user.id);
          if (!reward.claimed) {
            await ctx.answerCbQuery('Бонус уже забран сегодня');
            await ctx.reply('🎁 Приходи завтра за новым бонусом.', mainActionsKeyboard);
            break;
          }
          await ctx.answerCbQuery('Бонус получен!');
          await ctx.reply(
            `🎁 Получено ${reward.coins} монет. Серия входов: ${reward.streakDays} дн.`,
            mainActionsKeyboard,
          );
          break;
        }
        case 'status': {
          const pet = await deps.petService.ensurePet(user.id);
          await ctx.answerCbQuery('Статус обновлен');
          await ctx.replyWithMarkdown(deps.petService.buildPetView(pet), mainActionsKeyboard);
          break;
        }
        default:
          await ctx.answerCbQuery('Неизвестное действие');
      }
    } catch (error) {
      logger.error({ err: error, action, userId: user.id }, 'Action failed');
      const message = error instanceof Error ? error.message : 'Ошибка действия';
      await ctx.answerCbQuery('Ошибка');
      await ctx.reply(`⚠️ ${message}`, mainActionsKeyboard);
    }
  });
}
