import { Context, Markup } from 'telegraf';

export async function editOrReplyText(
  ctx: Context,
  text: string,
  keyboard?: ReturnType<typeof Markup.inlineKeyboard>,
  useMarkdown = false,
) {
  const extra = {
    ...(useMarkdown ? { parse_mode: 'Markdown' as const } : {}),
    ...(keyboard ?? {}),
  };

  if ('callback_query' in ctx.update) {
    const message = ctx.update.callback_query.message;
    if (message && 'photo' in message) {
      return ctx.editMessageCaption(text, extra);
    }
    return ctx.editMessageText(text, extra);
  }

  return ctx.reply(text, extra);
}
