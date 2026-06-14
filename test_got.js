async function test() {
    const { gotScraping } = await import("got-scraping");
    try {
        const { body } = await gotScraping({
            url: "https://www.xnxx.com",
            headerGeneratorOptions: {
                browsers: [{ name: "chrome", minVersion: 100 }]
            }
        });
        console.log("Success! Length:", body.length);
    } catch(e) {
        console.log("Got Error:", e.message);
    }
}
test();
