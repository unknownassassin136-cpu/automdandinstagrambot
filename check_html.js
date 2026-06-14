const cheerio = require("cheerio");
const fs = require("fs");

const html = fs.readFileSync("xnxx_home.html", "utf-8");
const $ = cheerio.load(html);

const firstVid = $(".thumb-block").first();
console.log("HTML inside first thumb-block:");
console.log(firstVid.html());
