const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { InputFile } = require("grammy");
const { CHANNEL_ID, TEMP_DIR, NUM_WORKERS } = require("../../config");
const { isUploaded, markAsUploaded } = require("../database/db");
const { getVideoDownloadUrl } = require("../scraper/scraper");
const { getVideosKeyboard } = require("../bot/keyboards");

class UploadManager {
  constructor(bot) {
    this.bot = bot;
    this.queue = [];
    this.processing = 0;
    this.maxWorkers = NUM_WORKERS;
    this.waiting = null; // resolve function for queue waiting

    // Ensure temp directory exists
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  async addToQueue(data) {
    this.queue.push(data);
    this._tryProcessNext();
  }

  _tryProcessNext() {
    while (this.processing < this.maxWorkers && this.queue.length > 0) {
      const data = this.queue.shift();
      this.processing++;
      this._processUpload(data)
        .catch((err) => console.error("Worker error:", err.message))
        .finally(() => {
          this.processing--;
          this._tryProcessNext();
        });
    }
  }

  async _processUpload(data) {
    const { url, title, statusMessageId, chatId } = data;

    try {
      // 1. Check if already uploaded
      if (isUploaded(url)) {
        await this.bot.api.editMessageText(
          chatId,
          statusMessageId,
          `⚠️ Video already uploaded:\n${title}`
        );
        return;
      }

      // 2. Extract download link
      await this.bot.api.editMessageText(
        chatId,
        statusMessageId,
        `🔍 Extracting download link for:\n${title}`
      );

      const downloadUrls = await getVideoDownloadUrl(url);
      if (!downloadUrls || !downloadUrls.high) {
        await this.bot.api.editMessageText(
          chatId,
          statusMessageId,
          `❌ Failed to extract download link for:\n${title}`
        );
        return;
      }

      // 3. Download the file locally
      await this.bot.api.editMessageText(
        chatId,
        statusMessageId,
        `⬇️ Downloading media...\n${title}`
      );

      const filePath = path.join(TEMP_DIR, `${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`);

      const downloaded = await this._downloadFile(
        downloadUrls.high,
        filePath,
        url,
        chatId,
        statusMessageId,
        title
      );

      if (!downloaded) {
        // Try low quality fallback
        if (downloadUrls.low && downloadUrls.low !== downloadUrls.high) {
          await this.bot.api.editMessageText(
            chatId,
            statusMessageId,
            `⚠️ Video is >50MB. Falling back to lower quality...\n${title}`
          );

          const downloadedLow = await this._downloadFile(
            downloadUrls.low,
            filePath,
            url,
            chatId,
            statusMessageId,
            title
          );

          if (!downloadedLow) {
            throw new Error("Even the low quality video exceeds Telegram's 50MB upload limit.");
          }
        } else {
          throw new Error("Video exceeds Telegram's 50MB upload limit and no lower quality is available.");
        }
      }

      // 4. Upload to channel
      await this.bot.api.editMessageText(
        chatId,
        statusMessageId,
        `☁️ Uploading to channel...\n${title}`
      );

      const fileStats = fs.statSync(filePath);
      const totalUploadSize = fileStats.size;
      let uploadedBytes = 0;
      let lastUploadUpdate = Date.now();

      // Create a readable stream that tracks progress as Telegram reads it
      const readStream = fs.createReadStream(filePath);
      readStream.on("data", async (chunk) => {
        uploadedBytes += chunk.length;
        if (Date.now() - lastUploadUpdate > 10000 && totalUploadSize > 0) {
          const progress = ((uploadedBytes / totalUploadSize) * 100).toFixed(1);
          try {
            await this.bot.api.editMessageText(
              chatId,
              statusMessageId,
              `☁️ Uploading: ${progress}%\n${title}`
            );
          } catch (e) {
            // ignore flood errors silently
          }
          lastUploadUpdate = Date.now();
        }
      });

      await this.bot.api.sendVideo(CHANNEL_ID, new InputFile(readStream, `${title}.mp4`), {
        caption: `${title}\n\n[Original Link](${url})`,
        parse_mode: "Markdown",
        supports_streaming: true,
        request_timeout: 3600,
      });

      // 5. Mark as uploaded
      markAsUploaded(url, title);

      // 6. Reorder messages: completion goes UP, video list stays at BOTTOM
      await this.bot.api.editMessageText(
        chatId,
        statusMessageId,
        `✅ Successfully uploaded to channel!\n${title}`
      );

      const { videoListMsgId, videoListContext } = data;
      if (videoListMsgId && videoListContext) {
        try {
          // Delete the old video list (currently above the status msg)
          await this.bot.api.deleteMessage(chatId, videoListMsgId);
          // Re-send video list BELOW the completion message
          const kb = getVideosKeyboard(
            videoListContext.videos,
            videoListContext.catIndex,
            videoListContext.page
          );
          await this.bot.api.sendMessage(
            chatId,
            `🎬 Videos in ${videoListContext.catName} (Page ${videoListContext.page}):`,
            { reply_markup: kb }
          );
        } catch (reorderErr) {
          if (!reorderErr.message.includes("message to delete not found")) {
            console.log("Could not reorder messages:", reorderErr.message);
          }
        }
      }

      // 7. Cleanup temp file
      this._cleanupFile(filePath);
    } catch (err) {
      const errorMsg = `❌ Error processing upload:\n${title}\n\nError: ${err.message}`;
      try {
        await this.bot.api.editMessageText(
          chatId,
          statusMessageId,
          errorMsg.substring(0, 4000)
        );
      } catch (e) {
        // ignore edit errors
      }

      // Cleanup on error too
      if (data._filePath) {
        this._cleanupFile(data._filePath);
      }
    }
  }

  /**
   * Download a file with progress updates.
   * Returns true on success, false if file is too large.
   */
  async _downloadFile(targetUrl, filePath, refererUrl, chatId, statusMsgId, title) {
    const response = await axios({
      method: "GET",
      url: targetUrl,
      responseType: "stream",
      timeout: 3600000, // 1 hour
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: refererUrl,
      },
    });

    const totalSize = parseInt(response.headers["content-length"] || "0", 10);
    if (totalSize > 49 * 1024 * 1024) {
      response.data.destroy();
      return false;
    }

    let downloaded = 0;
    let lastUpdate = Date.now();
    const writer = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      response.data.on("data", async (chunk) => {
        downloaded += chunk.length;

        // Update progress every 10 seconds to avoid Telegram rate limits
        if (Date.now() - lastUpdate > 10000 && totalSize > 0) {
          const progress = ((downloaded / totalSize) * 100).toFixed(1);
          try {
            await this.bot.api.editMessageText(
              chatId,
              statusMsgId,
              `⬇️ Downloading: ${progress}%\n${title}`
            );
          } catch (e) {
            // ignore flood errors silently
          }
          lastUpdate = Date.now();
        }
      });

      response.data.pipe(writer);

      writer.on("finish", () => resolve(true));
      writer.on("error", (err) => {
        this._cleanupFile(filePath);
        reject(err);
      });
      response.data.on("error", (err) => {
        this._cleanupFile(filePath);
        reject(err);
      });
    });
  }

  _cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.log("Cleanup failed:", e.message);
    }
  }

  /**
   * Recover any unuploaded videos from temp_downloads folder.
   */
  async recoverStrayVideos() {
    if (!fs.existsSync(TEMP_DIR)) return;

    const files = fs.readdirSync(TEMP_DIR).filter((f) => f.endsWith(".mp4"));
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      console.log(`Found unuploaded video ${file}, attempting to upload now...`);
      try {
        await this.bot.api.sendVideo(CHANNEL_ID, new InputFile(filePath), {
          caption: `Recovered Video: ${file}\n\n(Original title lost during bot restart)`,
          supports_streaming: true,
          request_timeout: 3600,
        });
        console.log(`Successfully recovered and uploaded ${file}`);
        this._cleanupFile(filePath);
      } catch (err) {
        console.error(`Failed to recover ${file}:`, err.message);
        this._cleanupFile(filePath);
      }
    }
  }
}

module.exports = { UploadManager };
