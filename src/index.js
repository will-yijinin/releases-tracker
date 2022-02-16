const { default: axios } = require("axios")
const http = require("http")
const rss = require('./rss.ts')

const feedUrl = "https://github.com/solana-labs/solana-web3.js/releases.atom";
const larkUrl = "https://open.larksuite.com/open-apis/bot/v2/hook/4374b8b5-bd42-4ff1-b020-194e33fa728a";

const app = http.createServer(async (request, response) => {
  console.log("hello")
  const feeds = await rss.getRssFeed(feedUrl);
  console.log(feeds)
  feeds.items.slice(0, 1).forEach(async (entry) => {
    const response = await axios.post(
      larkUrl,
      {
        "msg_type":"text",
        "content":{
          "text": entry.content
        }
      }
    );
    console.log(response.data)
  });
})

console.log("Started Server...")
app.listen(8000)
console.log("Listening on http://127.0.0.1:8000")
