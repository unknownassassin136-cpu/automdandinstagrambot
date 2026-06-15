require("dotenv").config();
const path = require("path");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const BASE_URL = process.env.BASE_URL || "https://www.xnxx.com";

// Parse ADMIN_IDS as array of numbers
const ADMIN_IDS = (process.env.ADMIN_IDS || "")
  .split(",")
  .map((id) => parseInt(id.trim(), 10))
  .filter((id) => !isNaN(id));

const DB_PATH = path.join(__dirname, "database", "bot.db");
const TEMP_DIR = path.join(__dirname, "temp_downloads");
const NUM_WORKERS = 1;
const HEADLESS = (process.env.HEADLESS || "True").toLowerCase() === "true";

module.exports = {
  BOT_TOKEN,
  CHANNEL_ID,
  BASE_URL,
  ADMIN_IDS,
  DB_PATH,
  TEMP_DIR,
  NUM_WORKERS,
  HEADLESS
};
