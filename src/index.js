const axios = require("axios");
const http = require("http");
const rss = require("./rss.ts");
const { larkUrl, feedUrl } = require("./constants");

// route：新增larkUrl和feedUrl对。POST，params：larkUrl，feedUrl
/**
 * 数据库表结构：
 * larkUrl: String
 * feedUrl: String
 * lastFetched: Timestamp
 */

// pm2 设置lifecycle management和自动重启。
const app = http.createServer(async (request, response) => {
  // 每隔10分钟循环从数据库中获取列表，
  console.log("hello");
  const feeds = await rss.getRssFeed(feedUrl);

  // 将获取的数据与数据库中的数据进行比较，如果有不同，更新数据。


  // 发送新的数据到相应的channel
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
