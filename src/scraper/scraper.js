const { chromium } = require("playwright");
const { BASE_URL, HEADLESS } = require("../../config");

let browser = null;
let context = null;

// Categories cache
let categoriesCache = [];
let categoriesCacheTime = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour in ms

async function initBrowser() {
  if (!browser) {
    console.log("🚀 Starting Playwright Browser...");
    browser = await chromium.launch({
      headless: HEADLESS,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu"
      ]
    });
    context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
      javaScriptEnabled: true,
      bypassCSP: true
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });
  }
  return context;
}

/**
 * Scrape categories from the homepage.
 */
async function getCategories() {
  if (categoriesCache.length > 0 && Date.now() - categoriesCacheTime < CACHE_TTL) {
    return categoriesCache;
  }

  const ctx = await initBrowser();
  const page = await ctx.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    
    // Evaluate script on the page directly just like Python did
    const categories = await page.evaluate((baseUrl) => {
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
      const links = document.querySelectorAll("a");

      links.forEach((el) => {
        const href = el.getAttribute("href");
        const text = el.innerText.trim();

        if (!href || text.length <= 2 || text.length >= 30) return;
        if (href.includes("/video-") || href.includes("/profile/")) return;

        const lower = text.toLowerCase();
        if (ignoreTexts.has(lower)) return;
        if (lower.includes("xnxx")) return;
        if (/^[\d,.]+$/.test(text)) return;
        if (seen.has(text)) return;

        const fullUrl = href.startsWith("http") ? href : `${baseUrl}${href}`;
        results.push({ name: text, url: fullUrl });
        seen.add(text);
      });

      return results.sort((a, b) => a.name.localeCompare(b.name));
    }, BASE_URL);

    // Fallback
    if (!categories || categories.length < 5) {
      return [
        { name: "Hot", url: `${BASE_URL}/search/hot` },
        { name: "New", url: `${BASE_URL}/search/new` },
        { name: "Hardcore", url: `${BASE_URL}/search/hardcore` },
        { name: "Asian", url: `${BASE_URL}/search/asian` }
      ];
    }

    categoriesCache = categories;
    categoriesCacheTime = Date.now();
    return categories;

  } catch (err) {
    console.error("Error fetching categories:", err.message);
    return [];
  } finally {
    await page.close();
  }
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

  const ctx = await initBrowser();
  const page = await ctx.newPage();

  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto(paginatedUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
        
        const videos = await page.evaluate((baseUrl) => {
          const results = [];
          const seen = new Set();
          
          const links = document.querySelectorAll("a[href*='/video-']");
          links.forEach((el) => {
            const href = el.getAttribute("href");
            if (!href || seen.has(href)) return;

            let title = el.getAttribute("title") || el.innerText.trim();
            if (!title || title.length < 3) {
              const parent = el.closest("div[id^='video_'], .thumb-block, .thumb");
              if (parent) {
                const p = parent.querySelector("p, .title");
                if (p) title = p.innerText.trim();
              }
            }

            let thumb = "";
            let img = el.querySelector("img");
            if (!img) {
              const parent = el.closest("div[id^='video_'], .thumb-block, .thumb");
              if (parent) img = parent.querySelector("img");
            }
            if (img) {
              thumb = img.getAttribute("data-src") || img.getAttribute("src") || "";
            }

            const fullUrl = href.startsWith("http") ? href : `${baseUrl}${href}`;

            if (title && title.length > 5 && !title.toLowerCase().includes("gold")) {
              const truncTitle = title.length > 60 ? title.substring(0, 60) + "..." : title;
              results.push({ title: truncTitle, url: fullUrl, thumbnail: thumb });
              seen.add(href);
            }
          });

          return results;
        }, BASE_URL);

        if (videos.length > 0) return videos;

      } catch (e) {
        console.error(`Attempt ${attempt + 1} failed:`, e.message);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Extract the direct MP4 download link from the video page.
 */
async function getVideoDownloadUrl(videoUrl) {
  const ctx = await initBrowser();
  const page = await ctx.newPage();

  // Block resources
  await page.route("**/*", (route) => {
    if (["image", "stylesheet", "font", "media"].includes(route.request().resourceType())) {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    await page.goto(videoUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    const downloadUrls = await page.evaluate(() => {
      let highUrl = null;
      let lowUrl = null;

      // Method 1: regex on script content
      const scripts = document.querySelectorAll("script");
      for (const script of scripts) {
        const text = script.innerText;
        if (!text) continue;

        const matchHigh = text.match(/setVideoUrlHigh\('([^']+)'\)/);
        if (matchHigh) highUrl = matchHigh[1];

        const matchLow = text.match(/setVideoUrlLow\('([^']+)'\)/);
        if (matchLow) lowUrl = matchLow[1];
      }

      if (highUrl || lowUrl) {
        return { high: highUrl, low: lowUrl || highUrl };
      }

      // Method 2: .mp4 links
      const links = document.querySelectorAll("a");
      for (const el of links) {
        const href = el.getAttribute("href");
        if (href && href.includes(".mp4")) {
          return { high: href, low: href };
        }
      }

      // Method 3: Video src
      const video = document.querySelector("video");
      if (video) {
        const src = video.getAttribute("src");
        if (src && !src.startsWith("blob:")) return { high: src, low: src };
        
        const source = video.querySelector("source");
        if (source) {
          const ssrc = source.getAttribute("src");
          if (ssrc && !ssrc.startsWith("blob:")) return { high: ssrc, low: ssrc };
        }
      }

      return null;
    });

    return downloadUrls;

  } catch (err) {
    console.error("Error getting download URL:", err.message);
    return null;
  } finally {
    await page.close();
  }
}

function closeBrowser() {
  if (browser) {
    browser.close();
    browser = null;
    context = null;
  }
}

module.exports = { getCategories, getVideos, getVideoDownloadUrl, closeBrowser, initBrowser };
