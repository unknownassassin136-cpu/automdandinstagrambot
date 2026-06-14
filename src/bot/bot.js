const { Bot } = require("grammy");
const { BOT_TOKEN, ADMIN_IDS } = require("../../config");
const { registerHandlers } = require("./handlers");

function createBot(uploadManager) {
  const bot = new Bot(BOT_TOKEN);

  // Admin-only middleware
  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ADMIN_IDS.includes(userId)) {
      if (ctx.message) {
        await ctx.reply("⛔ Access Denied. You are not authorized to use this bot.");
      } else if (ctx.callbackQuery) {
        await ctx.answerCallbackQuery({ text: "⛔ Access Denied.", show_alert: true });
      }
      return;
    }
    await next();
  });

  // Register all command and callback handlers
  registerHandlers(bot, uploadManager);

  // Error handler
  bot.catch((err) => {
    console.error("Bot error:", err.message);
  });

  return bot;
}

module.exports = { createBot };
