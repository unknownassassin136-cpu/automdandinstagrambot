async function testFetch() {
    try {
        const res = await fetch("https://www.xnxx.com", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            }
        });
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Length:", text.length);
    } catch(e) {
        console.log("Fetch Error:", e.message);
    }
}
testFetch();
