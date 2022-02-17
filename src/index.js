const axios = require("axios");
const http = require("http");
const rss = require("./rss.ts");
const { larkUrl, feedUrl } = require("./constants");
const { default: list } = require("./list");
const { Client } = require('pg');

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
  const client = new Client({
    connectionString: "postgres://zagqvwlvhksruv:f42ac867b90883c857ac488ab07839cabe90ab4fa458fcd15d5f79debf365138@ec2-54-155-194-191.eu-west-1.compute.amazonaws.com:5432/d5n63h01h3rse1",
    ssl: true
  })

  async function main() {
    await client.connect()
    const res = await client.query('SELECT $1::text as message', ['Hello world!'])
    console.log(res.rows[0].message) // Hello world!
    await client.end()
  }

  main();

  // 根据列表，http请求获取最新feeds
  console.log("hello");
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
