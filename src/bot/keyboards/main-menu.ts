import { Markup } from 'telegraf';

export const startKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('Завести питомца', 'pet:create')],
]);

export const mainActionsKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('🍗 Кормить', 'action:feed'),
    Markup.button.callback('🎮 Играть', 'action:play'),
  ],
  [
    Markup.button.callback('😴 Спать', 'action:sleep'),
    Markup.button.callback('🧼 Ухаживать', 'action:clean'),
  ],
  [
    Markup.button.callback('💊 Лечить (30)', 'action:heal'),
    Markup.button.callback('🎁 Ежедневный бонус', 'action:daily'),
  ],
  [Markup.button.callback('📊 Статус', 'action:status')],
]);
