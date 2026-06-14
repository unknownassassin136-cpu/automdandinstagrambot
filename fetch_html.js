const axios = require("axios");
const fs = require("fs");

async function fetchHtml() {
  try {
    const res = await axios.get("https://www.xnxx.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      }
    });
    fs.writeFileSync("xnxx_home.html", res.data);
    console.log("Saved to xnxx_home.html");
  } catch (err) {
    console.error(err.message);
  }
}

fetchHtml();
