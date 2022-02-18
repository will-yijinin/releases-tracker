const axios = require("axios");
const http = require("http");
const rss = require("./rss.ts");
const { larkUrl, feedUrl } = require("./constants");
const { default: list } = require("./list");

// route：新增larkUrl和feedUrl对。POST，params：larkUrl，feedUrl
/**
 * 数据库表结构：
 * larkUrl: String
 * feedUrl: String
 * lastFetched: Timestamp
 * newestFeed: Feed
 */

// pm2 设置lifecycle management和自动重启。
const app = http.createServer(async (request, response) => {
  // 每隔10分钟循环从数据库中获取列表
  await rss.init();

  console.log("--------------------------------Subscribe & Listing Subscriptions--------------------------------");
  await rss.subscribe(feedUrl, larkUrl, `<h2><a href="https://github.com/solana-labs/solana-web3.js/compare/v1.33.0...v1.34.0">1.34.0</a> (2022-02-09)</h2>
  <h3>Features</h3>
  <ul>
  <li><strong>vote-program:</strong> support VoteInstruction::Authorize (<a href="https://github.com/solana-labs/solana/issues/22978" data-hovercard-type="pull_request" data-hovercard-url="/solana-labs/solana/pull/22978/hovercard">#22978</a>) (<a href="https://github.com/solana-labs/solana-web3.js/commit/829cf65d5a665b1418e27ea484ead6bac52a89f2">829cf65</a>)</li>
  </ul>`);
  console.log(await rss.listSubscriptions(feedUrl));


  console.log("-----------------------------------Change and Get Newest feed------------------------------------");
  await rss.changeNewestFeed(feedUrl, "changed feed");
  console.log(await rss.getNewestFeed(feedUrl));


  console.log("-------------------------------Unsubscribe & Listing Subscriptions-------------------------------");
  await rss.unSubscribe(feedUrl);
  console.log(await rss.listSubscriptions(feedUrl));


  process.exit(0);

  // 根据列表，http请求获取最新feeds
  const feeds = await rss.getRssFeed(feedUrl);


  // 将获取的数据与数据库中的数据进行比较，如果有不同，更新数据库中的数据。同时记录上次发送请求的时间


  // 发送新的数据到相应的lark channel
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
});

console.log("Started Server...")
const port = process.env.PORT || 8000;
app.listen(port);
console.log(`Listening on http://127.0.0.1:${port}`);
