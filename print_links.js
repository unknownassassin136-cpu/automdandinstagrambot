const cheerio = require("cheerio");
const fs = require("fs");

const html = fs.readFileSync("xnxx_home.html", "utf-8");
const $ = cheerio.load(html);

const links = [];
$("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href");
    if (text && href) {
        links.push(`${text} -> ${href}`);
    }
});
console.log(links.slice(0, 50).join("\n"));
console.log("...");
console.log(links.slice(-50).join("\n"));
