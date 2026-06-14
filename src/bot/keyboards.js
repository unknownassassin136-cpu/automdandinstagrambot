const { InlineKeyboard } = require("grammy");

/**
 * Build categories inline keyboard with pagination.
 */
function getCategoriesKeyboard(categories, page = 1, perPage = 10) {
  const kb = new InlineKeyboard();

  const startIdx = (page - 1) * perPage;
  const endIdx = startIdx + perPage;
  const current = categories.slice(startIdx, endIdx);

  // 2 buttons per row
  for (let i = 0; i < current.length; i += 2) {
    const idx1 = startIdx + i;
    kb.text(current[i].name, `cat_${idx1}`);
    if (i + 1 < current.length) {
      const idx2 = startIdx + i + 1;
      kb.text(current[i + 1].name, `cat_${idx2}`);
    }
    kb.row();
  }

  // Pagination nav
  const navRow = [];
  if (page > 1) {
    navRow.push({ text: "⬅️ Prev", callback_data: `catpage_${page - 1}` });
  }
  if (endIdx < categories.length) {
    navRow.push({ text: "Next ➡️", callback_data: `catpage_${page + 1}` });
  }
  if (navRow.length) {
    for (const btn of navRow) {
      kb.text(btn.text, btn.callback_data);
    }
    kb.row();
  }

  return kb;
}

/**
 * Build videos inline keyboard with pagination.
 */
function getVideosKeyboard(videos, catIndex, page = 1) {
  const kb = new InlineKeyboard();

  // 1 button per row (titles are long)
  for (let i = 0; i < videos.length; i++) {
    kb.text(videos[i].title, `vid_${catIndex}_${page}_${i}`).row();
  }

  // Back to categories
  kb.text("🔙 Back to Categories", "back_to_categories").row();

  // Pagination
  const navRow = [];
  if (page > 1) {
    navRow.push({ text: "⬅️ Prev Page", callback_data: `vidpage_${catIndex}_${page - 1}` });
  }
  if (videos.length > 0) {
    navRow.push({ text: "Next Page ➡️", callback_data: `vidpage_${catIndex}_${page + 1}` });
  }
  if (navRow.length) {
    for (const btn of navRow) {
      kb.text(btn.text, btn.callback_data);
    }
    kb.row();
  }

  return kb;
}

module.exports = { getCategoriesKeyboard, getVideosKeyboard };
