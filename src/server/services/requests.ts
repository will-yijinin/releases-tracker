import RSSParser from "rss-parser";

export function getRssFeed(feedUrl: string) {
    let parser = new RSSParser();
    return new Promise((resolve, reject) => {
        parser.parseURL(
            feedUrl,
            function(err, feed) {
                if (err) reject(err);
                resolve(feed);
            }
        )
    });
};
