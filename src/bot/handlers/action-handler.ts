import { Telegraf } from 'telegraf';
import { logger } from '../../config/logger';
import { mainActionsKeyboard } from '../keyboards/main-menu';
import { UserRepository } from '../../repositories/user-repository';
import { PetService } from '../../services/pet-service';
import { DailyService } from '../../services/daily-service';
import { CooldownService } from '../../services/cooldown-service';
import { editOrReplyText } from '../utils/message-editor';

type Deps = {
  userRepo: UserRepository;
  petService: PetService;
  dailyService: DailyService;
  cooldownService: CooldownService;
};

const COOLDOWN_ACTIONS = new Set(['feed', 'play', 'sleep', 'clean', 'heal']);

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

    if (COOLDOWN_ACTIONS.has(action)) {
      const cooldown = deps.cooldownService.check(user.id, action);
      if (!cooldown.allowed) {
        await ctx.answerCbQuery(`Подожди ${cooldown.secondsLeft} сек.`, { show_alert: true });
        return;
      }
    }

    try {
      switch (action) {
        case 'feed': {
          const result = await deps.petService.feed(user.id);
          await ctx.answerCbQuery('Котость накормлена!');
          await editOrReplyText(
            ctx,
            `🍗 Сытость повышена, +${result.gainedXp} XP, +${result.gainedCoins} монет.`,
            mainActionsKeyboard,
          );
          break;
        }
        case 'play': {
          const result = await deps.petService.play(user.id);
          await ctx.answerCbQuery('Вы отлично поиграли!');
          await editOrReplyText(
            ctx,
            `🎮 Счастье +, энергия -, +${result.gainedXp} XP, +${result.gainedCoins} монет.`,
            mainActionsKeyboard,
          );
          break;
        }
        case 'sleep': {
          await deps.petService.sleep(user.id);
          await ctx.answerCbQuery('Питомец отдыхает 😴');
          await editOrReplyText(ctx, '⚡ Энергия восстановлена.', mainActionsKeyboard);
          break;
        }
        case 'clean': {
          await deps.petService.clean(user.id);
          await ctx.answerCbQuery('Питомец чист и доволен ✨');
          await editOrReplyText(ctx, '🧼 Чистота улучшила здоровье и настроение.', mainActionsKeyboard);
          break;
        }
        case 'heal': {
          await deps.petService.heal(user.id);
          await ctx.answerCbQuery('Лечение выполнено 💊');
          await editOrReplyText(ctx, '❤️ Здоровье улучшено (-30 монет).', mainActionsKeyboard);
          break;
        }
        case 'daily': {
          const reward = await deps.dailyService.claimDaily(user.id);
          if (!reward.claimed) {
            await ctx.answerCbQuery('Бонус уже забран сегодня');
            await editOrReplyText(ctx, '🎁 Приходи завтра за новым бонусом.', mainActionsKeyboard);
            break;
          }
          await ctx.answerCbQuery('Бонус получен!');
          await editOrReplyText(
            ctx,
            `🎁 Получено ${reward.coins} монет. Серия входов: ${reward.streakDays} дн.`,
            mainActionsKeyboard,
          );
          break;
        }
        case 'status': {
          const pet = await deps.petService.ensurePet(user.id);
          await ctx.answerCbQuery('Статус обновлен');
          await editOrReplyText(ctx, deps.petService.buildPetView(pet), mainActionsKeyboard, true);
          break;
        }
        default:
          await ctx.answerCbQuery('Неизвестное действие');
      }
    } catch (error) {
      logger.error({ err: error, action, userId: user.id }, 'Action failed');
      const message = error instanceof Error ? error.message : 'Ошибка действия';
      await ctx.answerCbQuery('Ошибка');
      await editOrReplyText(ctx, `⚠️ ${message}`, mainActionsKeyboard);
    }
  });
}
