const cheerio = require("cheerio");
const axios = require("axios");
const https = require("https");
const { BASE_URL } = require("../../config");

// Categories cache
let categoriesCache = [];
let categoriesCacheTime = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour in ms

const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false
});

const AXIOS_OPTIONS = {
  httpsAgent,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
  },
  timeout: 15000
};

/**
 * Fetch HTML with retries to bypass aggressive ECONNRESET / rate limiting.
 */
async function fetchHtmlWithRetry(url, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(url, AXIOS_OPTIONS);
      return response.data;
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed for ${url}: ${err.message}`);
      if (attempt === maxRetries - 1) throw err;
      // Exponential backoff
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
}

/**
 * Scrape categories from the homepage.
 */
async function getCategories() {
  if (categoriesCache.length > 0 && Date.now() - categoriesCacheTime < CACHE_TTL) {
    return categoriesCache;
  }

  try {
    const html = await fetchHtmlWithRetry(BASE_URL, 3);
    const $ = cheerio.load(html);
    
    const ignoreTexts = new Set([
      "log in", "sign up", "upload", "language", "content", "straight",
      "gay", "top", "a - z", "best of", "hits", "tags", "pictures",
      "live cams", "sex stories", "forum", "pornstars", "games",
      "dating", "history", "suggestions", "clear your history", "disable it",
      "create account", "sign in", "gold", "more... (full list)", 
      "remove ads - upgrade to premium", "trafficfactory", "xnxx images",
      "animated gifs", "stories", "think about bookmarking our site!",
      "please use our forum", "contact us", "webmasters click here",
      "terms of service", "privacy policy", "privacy notice", 
      "cookie preferences", "content removal"
    ]);

    const seen = new Set();
    const results = [];

    $("a").each((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim();

      if (!href || text.length <= 2 || text.length >= 30) return;
      if (href.includes("/video-") || href.includes("/profile/")) return;

      const lower = text.toLowerCase();
      if (ignoreTexts.has(lower)) return;
      if (lower.includes("xnxx")) return;
      if (/^[\d,.]+$/.test(text)) return;
      if (seen.has(text)) return;

      const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      results.push({ name: text, url: fullUrl });
      seen.add(text);
    });

    const finalCategories = results.sort((a, b) => a.name.localeCompare(b.name));

    if (finalCategories.length >= 5) {
      categoriesCache = finalCategories;
      categoriesCacheTime = Date.now();
      return finalCategories;
    }
  } catch (err) {
    console.error("Error fetching categories:", err.message);
  }

  // Fallback if scraping fails
  return [
    { name: "Hot", url: `${BASE_URL}/search/hot` },
    { name: "New", url: `${BASE_URL}/search/new` },
    { name: "Hardcore", url: `${BASE_URL}/search/hardcore` },
    { name: "Asian", url: `${BASE_URL}/search/asian` },
    { name: "Anal", url: `${BASE_URL}/search/anal` },
    { name: "Teen", url: `${BASE_URL}/search/teen` },
    { name: "MILF", url: `${BASE_URL}/search/milf` },
    { name: "Mature", url: `${BASE_URL}/search/mature` },
    { name: "POV", url: `${BASE_URL}/search/pov` },
    { name: "Gay", url: `${BASE_URL}/search/gay` },
    { name: "Lesbian", url: `${BASE_URL}/search/lesbian` },
    { name: "BBW", url: `${BASE_URL}/search/bbw` },
    { name: "Ebony", url: `${BASE_URL}/search/ebony` },
    { name: "Indian", url: `${BASE_URL}/search/indian` },
    { name: "Latina", url: `${BASE_URL}/search/latina` },
    { name: "Vintage", url: `${BASE_URL}/search/vintage` },
    { name: "Massage", url: `${BASE_URL}/search/massage` },
    { name: "Cuckold", url: `${BASE_URL}/search/cuckold` },
    { name: "Creampie", url: `${BASE_URL}/search/creampie` },
    { name: "Squirt", url: `${BASE_URL}/search/squirt` },
    { name: "BDSM", url: `${BASE_URL}/search/bdsm` },
    { name: "Hentai", url: `${BASE_URL}/search/hentai` },
    { name: "Compilation", url: `${BASE_URL}/search/compilation` },
    { name: "Public", url: `${BASE_URL}/search/public` },
    { name: "Big Tits", url: `${BASE_URL}/search/big+tits` },
    { name: "Big Ass", url: `${BASE_URL}/search/big+ass` },
    { name: "Threesome", url: `${BASE_URL}/search/threesome` },
    { name: "Shemale", url: `${BASE_URL}/search/shemale` },
    { name: "Amateur", url: `${BASE_URL}/search/amateur` }
  ];
}

/**
 * Scrape video list from a category page.
 */
async function getVideos(categoryUrl, pageNum = 1) {
  let paginatedUrl = categoryUrl;
  if (pageNum > 1) {
    paginatedUrl = categoryUrl.includes("?")
      ? `${categoryUrl}&p=${pageNum}`
      : `${categoryUrl}/${pageNum}`;
  }

  try {
    const html = await fetchHtmlWithRetry(paginatedUrl, 5);
    const $ = cheerio.load(html);
    
    const results = [];
    const seen = new Set();
    
    $("a[href*='/video-']").each((i, el) => {
      const href = $(el).attr("href");
      if (!href || seen.has(href)) return;

      let title = $(el).attr("title") || $(el).text().trim();
      if (!title || title.length < 3) {
        const parent = $(el).closest("div[id^='video_'], .thumb-block, .thumb");
        if (parent.length) {
          const p = parent.find("p, .title");
          if (p.length) title = p.text().trim();
        }
      }

      let thumb = "";
      let img = $(el).find("img");
      if (!img.length) {
        const parent = $(el).closest("div[id^='video_'], .thumb-block, .thumb");
        if (parent.length) img = parent.find("img");
      }
      if (img.length) {
        thumb = img.attr("data-src") || img.attr("src") || "";
      }

      const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;

      if (title && title.length > 5 && !title.toLowerCase().includes("gold")) {
        const truncTitle = title.length > 60 ? title.substring(0, 60) + "..." : title;
        results.push({ title: truncTitle, url: fullUrl, thumbnail: thumb });
        seen.add(href);
      }
    });

    if (results.length > 0) return results;

  } catch (e) {
    console.error("Failed to fetch videos after retries:", e.message);
  }
  
  return [];
}

/**
 * Extract the direct MP4 download link from the video page.
 */
async function getVideoDownloadUrl(videoUrl) {
  try {
    const html = await fetchHtmlWithRetry(videoUrl, 5);

    let highUrl = null;
    let lowUrl = null;

    // Method 1: regex on script content
    const matchHigh = html.match(/setVideoUrlHigh\('([^']+)'\)/);
    if (matchHigh) highUrl = matchHigh[1];

    const matchLow = html.match(/setVideoUrlLow\('([^']+)'\)/);
    if (matchLow) lowUrl = matchLow[1];

    if (highUrl || lowUrl) {
      return { high: highUrl, low: lowUrl || highUrl };
    }

    // Method 2: .mp4 links (fallback)
    const $ = cheerio.load(html);
    let fallbackHref = null;
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.includes(".mp4")) {
        fallbackHref = href;
        return false; // break
      }
    });
    
    if (fallbackHref) {
      return { high: fallbackHref, low: fallbackHref };
    }

    // Method 3: Video src
    let fallbackSrc = null;
    const video = $("video");
    if (video.length) {
      const src = video.attr("src");
      if (src && !src.startsWith("blob:")) fallbackSrc = src;
      else {
        const source = video.find("source");
        if (source.length) {
          const ssrc = source.attr("src");
          if (ssrc && !ssrc.startsWith("blob:")) fallbackSrc = ssrc;
        }
      }
    }
    
    if (fallbackSrc) {
      return { high: fallbackSrc, low: fallbackSrc };
    }

    return null;

  } catch (err) {
    console.error("Error getting download URL:", err.message);
    return null;
  }
}

// Dummy functions since we don't need a browser anymore
function closeBrowser() {}
async function initBrowser() {}

module.exports = { getCategories, getVideos, getVideoDownloadUrl, closeBrowser, initBrowser };
