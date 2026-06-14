const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");
const { DB_PATH } = require("../../config");

let db;

async function initDb() {
  // Ensure directory exists
  const dir = path.dirname(DB_PATH);
  fs.mkdirSync(dir, { recursive: true });

  const SQL = await initSqlJs();

  // Load existing database if it exists
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS uploaded_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_url TEXT UNIQUE NOT NULL,
      title TEXT,
      upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Save to disk
  saveDb();

  console.log("✅ Database initialized");
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function isUploaded(videoUrl) {
  const result = db.exec("SELECT 1 FROM uploaded_media WHERE video_url = ?", [videoUrl]);
  return result.length > 0 && result[0].values.length > 0;
}

function markAsUploaded(videoUrl, title) {
  db.run("INSERT OR IGNORE INTO uploaded_media (video_url, title) VALUES (?, ?)", [
    videoUrl,
    title,
  ]);
  saveDb(); // Persist after each write
}

function getDb() {
  return db;
}

module.exports = { initDb, isUploaded, markAsUploaded, getDb };
