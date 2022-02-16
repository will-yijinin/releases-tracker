const rss = require("./rss.ts");

const feedUrl = "https://www.cnbc.com/id/100727362/device/rss/rss.html";

rss.getRssFeed(feedUrl).then((feed) => {
    console.log(feed.title);
    feed.items.slice(0, 5).forEach(function(entry) {
        console.log(entry.title + ':' + entry.link);
    });
});
