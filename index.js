const { BOT_TOKEN } = require("./config");
const { initDb } = require("./src/database/db");
const { createBot } = require("./src/bot/bot");
const { UploadManager } = require("./src/uploader/manager");
const { initBrowser, closeBrowser } = require("./src/scraper/scraper");

async function main() {
  if (!BOT_TOKEN) {
    console.error("Error: BOT_TOKEN is missing in .env");
    process.exit(1);
  }

  // 1. Initialize database & browser
  initDb();
  await initBrowser();

  // 2. Create upload manager (needs bot reference, set after bot creation)
  // We create a temporary bot reference first
  const { Bot } = require("grammy");
  const botInstance = new Bot(BOT_TOKEN);

  const uploadManager = new UploadManager(botInstance);

  // 3. Create bot with handlers
  const bot = createBot(uploadManager);

  // Update upload manager to use the actual bot with middleware
  uploadManager.bot = bot;

  // 4. Recover stray videos in the background
  uploadManager.recoverStrayVideos().catch((err) => {
    console.error("Stray video recovery error:", err.message);
  });

  // 5. Start polling
  console.log("Bot is running...");

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("Shutting down...");
    bot.stop();
    closeBrowser();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("Shutting down...");
    bot.stop();
    closeBrowser();
    process.exit(0);
  });

  await bot.start({
    onStart: (botInfo) => {
      console.log(`Bot @${botInfo.username} started with ${uploadManager.maxWorkers} workers`);
    },
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
