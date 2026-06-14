const { InlineKeyboard } = require("grammy");
const { getCategories, getVideos } = require("../scraper/scraper");
const { getCategoriesKeyboard, getVideosKeyboard } = require("./keyboards");

// In-memory cache per chat: { chatId: { categories: [], videos: { "catIdx_page": [] } } }
const cache = {};

function getCache(chatId) {
  if (!cache[chatId]) {
    cache[chatId] = { categories: [], videos: {} };
  }
  return cache[chatId];
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Register all handlers on the bot composer.
 */
function registerHandlers(bot, uploadManager) {
  // /start command
  bot.command("start", async (ctx) => {
    const chatId = ctx.chat.id;
    const userCache = getCache(chatId);

    const statusMsg = await ctx.reply(
      "🔄 Initializing bot and fetching categories. Please wait..."
    );

    const categories = await getCategories();
    if (!categories || categories.length === 0) {
      await ctx.api.editMessageText(
        chatId,
        statusMsg.message_id,
        "❌ Failed to fetch categories. You can also paste a URL directly!"
      );
      return;
    }

    userCache.categories = categories;

    const kb = getCategoriesKeyboard(categories, 1);
    await ctx.api.editMessageText(
      chatId,
      statusMsg.message_id,
      "🔥 Welcome to the Auto Media Downloader Bot!\n\nPlease select a category or paste a link directly:",
      { reply_markup: kb }
    );
  });

  // Direct video URL handler
  bot.hears(/^https?:\/\/(www\.)?xnxx\.com\/video-.*/, async (ctx) => {
    const url = ctx.message.text.trim();
    const title = url.split("/").pop().replace(/_/g, " ");

    const statusMsg = await ctx.reply(`⏳ Queuing upload for direct link...`);

    await uploadManager.addToQueue({
      url,
      title,
      statusMessageId: statusMsg.message_id,
      chatId: ctx.chat.id,
    });

    await ctx.reply("✅ Added to upload queue!");
  });

  // Direct category/search URL handler
  bot.hears(/^https?:\/\/(www\.)?xnxx\.com\/.*/, async (ctx) => {
    const url = ctx.message.text.trim();
    if (url.includes("/video-")) return; // Handled above

    const chatId = ctx.chat.id;
    const userCache = getCache(chatId);

    const statusMsg = await ctx.reply(`🔄 Fetching videos from custom link (Page 1)...`);

    // Run in background
    (async () => {
      try {
        const videos = await getVideos(url, 1);
        if (!videos || videos.length === 0) {
          await ctx.api.editMessageText(chatId, statusMsg.message_id, "❌ Failed to fetch videos from this link.");
          return;
        }

        const catIdx = 999;
        userCache.videos[`${catIdx}_1`] = videos;

        // Ensure categories list is large enough
        while (userCache.categories.length <= catIdx) {
          userCache.categories.push({ name: "Custom", url });
        }
        userCache.categories[catIdx] = { name: "Custom", url };

        const kb = getVideosKeyboard(videos, catIdx, 1);
        await ctx.api.editMessageText(chatId, statusMsg.message_id, "🎬 Videos from custom link:", {
          reply_markup: kb,
        });
      } catch (err) {
        console.error("Custom link error:", err.message);
      }
    })();
  });

  // Category pagination
  bot.callbackQuery(/^catpage_(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match[1], 10);
    const chatId = ctx.chat.id;
    const categories = getCache(chatId).categories;

    if (!categories.length) {
      await ctx.answerCallbackQuery({ text: "Cache expired. Please send /start", show_alert: true });
      return;
    }

    const kb = getCategoriesKeyboard(categories, page);
    await ctx.editMessageReplyMarkup({ reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  // Back to categories
  bot.callbackQuery("back_to_categories", async (ctx) => {
    const chatId = ctx.chat.id;
    const categories = getCache(chatId).categories;

    if (!categories.length) {
      await ctx.answerCallbackQuery({ text: "Cache expired. Please send /start", show_alert: true });
      return;
    }

    const kb = getCategoriesKeyboard(categories, 1);
    await ctx.editMessageText("📂 Select a Category:", { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  // Select a category
  bot.callbackQuery(/^cat_(\d+)$/, async (ctx) => {
    const catIdx = parseInt(ctx.match[1], 10);
    const chatId = ctx.chat.id;
    const categories = getCache(chatId).categories;

    if (!categories.length || catIdx >= categories.length) {
      await ctx.answerCallbackQuery({ text: "Category not found.", show_alert: true });
      return;
    }

    const category = categories[catIdx];
    await ctx.editMessageText(`🔄 Fetching videos for ${category.name} (Page 1)...`);
    const msgId = ctx.callbackQuery.message.message_id;

    // Run in background
    (async () => {
      try {
        const videos = await getVideos(category.url, 1);
        if (!videos || videos.length === 0) {
          await ctx.api.editMessageText(chatId, msgId, "❌ Failed to fetch videos or category is empty.");
          return;
        }

        getCache(chatId).videos[`${catIdx}_1`] = videos;

        const kb = getVideosKeyboard(videos, catIdx, 1);
        await ctx.api.editMessageText(chatId, msgId, `🎬 Videos in ${category.name}:`, {
          reply_markup: kb,
        });
      } catch (err) {
        console.error("Fetch videos error:", err.message);
      }
    })();

    await ctx.answerCallbackQuery();
  });

  // Video page pagination
  bot.callbackQuery(/^vidpage_(\d+)_(\d+)$/, async (ctx) => {
    const catIdx = parseInt(ctx.match[1], 10);
    const page = parseInt(ctx.match[2], 10);
    const chatId = ctx.chat.id;
    const categories = getCache(chatId).categories;

    if (!categories.length || catIdx >= categories.length) {
      await ctx.answerCallbackQuery({ text: "Category not found.", show_alert: true });
      return;
    }

    const category = categories[catIdx];
    await ctx.editMessageText(`🔄 Fetching videos for ${category.name} (Page ${page})...`);
    const msgId = ctx.callbackQuery.message.message_id;

    // Run in background
    (async () => {
      try {
        const videos = await getVideos(category.url, page);
        if (!videos || videos.length === 0) {
          const kb = new InlineKeyboard().text("🔙 Back to Categories", "back_to_categories");
          await ctx.api.editMessageText(chatId, msgId, "❌ Failed to fetch videos. Reached the end?", {
            reply_markup: kb,
          });
          return;
        }

        getCache(chatId).videos[`${catIdx}_${page}`] = videos;

        const kb = getVideosKeyboard(videos, catIdx, page);
        await ctx.api.editMessageText(chatId, msgId, `🎬 Videos in ${category.name} (Page ${page}):`, {
          reply_markup: kb,
        });
      } catch (err) {
        console.error("Video pagination error:", err.message);
      }
    })();

    await ctx.answerCallbackQuery();
  });

  // Select a video (show detail + actions)
  bot.callbackQuery(/^vid_(\d+)_(\d+)_(\d+)$/, async (ctx) => {
    const catIdx = parseInt(ctx.match[1], 10);
    const page = parseInt(ctx.match[2], 10);
    const vidIdx = parseInt(ctx.match[3], 10);
    const chatId = ctx.chat.id;

    const videos = getCache(chatId).videos[`${catIdx}_${page}`] || [];
    if (!videos.length || vidIdx >= videos.length) {
      await ctx.answerCallbackQuery({ text: "Video not found in cache.", show_alert: true });
      return;
    }

    const video = videos[vidIdx];

    // Build embed URL
    const urlParts = video.url.split("/");
    const videoId = urlParts[3] || "";
    const embedUrl = `https://www.xnxx.com/embed/${videoId}`;

    const kb = new InlineKeyboard();
    if (videoId && videoId.includes("video")) {
      kb.webApp("🎥 Watch Live", embedUrl).row();
    }
    kb.text("☁️ Upload to Channel", `upload_${catIdx}_${page}_${vidIdx}`).row();
    kb.url("🌐 Open on Web", video.url).row();
    kb.text("🔙 Back to Videos", `vidpage_${catIdx}_${page}`).row();

    const escapedTitle = escapeHtml(video.title);

    if (video.thumbnail) {
      const text = `<a href="${video.thumbnail}">&#8205;</a><b>${escapedTitle}</b>\n\nSelect an action:`;
      await ctx.editMessageText(text, {
        reply_markup: kb,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: false, prefer_small_media: true },
      });
    } else {
      const text = `<b>${escapedTitle}</b>\n\nSelect an action:`;
      await ctx.editMessageText(text, {
        reply_markup: kb,
        parse_mode: "HTML",
      });
    }

    await ctx.answerCallbackQuery();
  });

  // Upload to channel
  bot.callbackQuery(/^upload_(\d+)_(\d+)_(\d+)$/, async (ctx) => {
    const catIdx = parseInt(ctx.match[1], 10);
    const page = parseInt(ctx.match[2], 10);
    const vidIdx = parseInt(ctx.match[3], 10);
    const chatId = ctx.chat.id;

    const videos = getCache(chatId).videos[`${catIdx}_${page}`] || [];
    if (!videos.length || vidIdx >= videos.length) {
      await ctx.answerCallbackQuery({ text: "Video not found in cache.", show_alert: true });
      return;
    }

    const video = videos[vidIdx];
    const categories = getCache(chatId).categories;
    const catName = catIdx < categories.length ? categories[catIdx].name : "Videos";

    // 1. Edit current message back to video list (stays in its position)
    const kb = getVideosKeyboard(videos, catIdx, page);
    await ctx.editMessageText(`🎬 Videos in ${catName} (Page ${page}):`, { reply_markup: kb });
    const videoListMsgId = ctx.callbackQuery.message.message_id;

    // 2. Send status message BELOW video list (pinned to bottom during progress)
    const statusMsg = await ctx.reply(`⏳ Queued: ${video.title}`);

    // 3. Queue upload with video list context for reordering on completion
    await uploadManager.addToQueue({
      url: video.url,
      title: video.title,
      statusMessageId: statusMsg.message_id,
      chatId,
      videoListMsgId,
      videoListContext: {
        videos,
        catIndex: catIdx,
        page,
        catName,
      },
    });

    await ctx.answerCallbackQuery("✅ Added to upload queue!");
  });
}

module.exports = { registerHandlers };
