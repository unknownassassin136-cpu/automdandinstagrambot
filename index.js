const instagramServer = require("./src/instagram_server/index.js");

function main() {
  console.log("Starting Instagram Webhook Server...");
  instagramServer.startServer();
}

main();

