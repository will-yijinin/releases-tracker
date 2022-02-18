import RSSParser from "rss-parser";
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgres://zagqvwlvhksruv:f42ac867b90883c857ac488ab07839cabe90ab4fa458fcd15d5f79debf365138@ec2-54-155-194-191.eu-west-1.compute.amazonaws.com:5432/d5n63h01h3rse1",
    ssl: true
});

// TODO: error: duplicate key value violates unique constraint "releases7_pkey"
const tableName = "releases11"

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

/**
 * 数据库表结构：
 * larkUrl: String
 * feedUrl: String
 * lastFetched: Timestamp
 * newestFeed: Feed
 */
export async function init(){
    // TODO: check if already connected, if so, do not connect. Or use pool. 刷新页面复现
    await client.connect();
    await client.query(
        `CREATE TABLE IF NOT EXISTS ${tableName} (
            feed_url varchar PRIMARY KEY,
            lark_url varchar,
            last_fetched varchar,
            newest_feed varchar
        )`
    );
}

export async function subscribe(feedUrl, larkUrl) {
    let res = await client.query(
        `INSERT INTO ${tableName}(feed_url,lark_url) VALUES ($1, $2)`,
        [feedUrl, larkUrl]
    );
    return res;
};

export async function unSubscribe(feedUrl) {
    let res = await client.query(
        `DELETE FROM ${tableName} WHERE feed_url=$1`,
        [feedUrl]
    );
    return res;
};

export async function changeNewestFeed(feedUrl, newestFeed) {
    let res = await client.query(
        `UPDATE ${tableName} SET newest_feed = $2
        WHERE feed_url=$1`,
        [feedUrl, newestFeed]
    );
    return res;
};

export async function getNewestFeed(feedUrl) {
    let res = await client.query(
        `SELECT newest_feed from ${tableName}
        WHERE feed_url=$1`,
        [feedUrl]
    );
    if (res.rows.length === 0) {
        return null
    }
    return res.rows[0].newest_feed;
};

export async function listSubscriptions() {
    let res = await client.query(
        `SELECT feed_url, lark_url, last_fetched, newest_feed from ${tableName}`,
    );
    return res.rows;
};