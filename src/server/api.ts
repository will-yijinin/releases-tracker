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

export async function getOpNodeVersion(feedUrl: string) {
    try{
        return `0.0.1 ${feedUrl}`;
    }catch(error){
        console.log(error);
        return;
    }
};

