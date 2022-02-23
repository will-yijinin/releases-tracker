import RSSParser from "rss-parser";

export function getRssFeed(feedUrl) {
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

export async function getOpNodeVersion(feedUrl) {
    try{
        return `0.0.1 ${feedUrl}`;
    }catch(error){
        console.log(error);
        return;
    }
};

