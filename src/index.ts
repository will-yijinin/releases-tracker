import RSSParser from "rss-parser";

const feedUrl = "https://www.cnbc.com/id/100727362/device/rss/rss.html"

let parser = new RSSParser();
parser.parseURL(feedUrl, function(err, feed) {
    if (err) throw err;
    console.log(feed.title);
    feed.items.slice(0, 5).forEach(function(entry) {
        console.log(entry.title + ':' + entry.link);
    })
});
