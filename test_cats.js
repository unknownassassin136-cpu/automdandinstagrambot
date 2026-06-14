const { getCategories } = require("./src/scraper/scraper");

async function test() {
    try {
        const cats = await getCategories();
        console.log("Found", cats.length, "categories:");
        cats.forEach(c => console.log(c.name, c.url));
    } catch (e) {
        console.log("TEST ERROR:", e);
    }
}

test().catch(console.error);
