const { Pool } = require("pg");

const fs = require("fs");
const path = `${__dirname}/mock-data.js`;
let localData: any = {};
if (fs.existsSync(path)) {
    // path exists
    localData = require(path);
}
const { DATABASE_URL } = localData;

// 使用Pool解决reconnect问题
const client = new Pool({
    connectionString: process.env.DATABASE_URL || DATABASE_URL,
    ssl: true,
    // Timeout: 60 seconds
    connectionTimeoutMillis: 60000,
    max : 5
});

// TODO: error: duplicate key value violates unique constraint "releases_pkey"
const tableName = "releases"

/********************************** 数据库操作 ************************************/
/**
 * 数据库表结构：
 * feed_url: String
 * lark_url: String
 * newest_feed: Feed
 * node_version: String github节点版本
 * op_node_version: String 运维节点版本
 */
 export async function init(){
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

export async function updateNewestFeed(feedUrl, newestFeed, nodeVersion) {
    let res = await client.query(
        `UPDATE ${tableName} SET newest_feed = $2, node_version = $3
        WHERE feed_url=$1`,
        [feedUrl, newestFeed, nodeVersion]
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
        `SELECT * from ${tableName}`,
    );
    return res.rows;
};

export async function deleteTable(tableName) {
    let res = await client.query(
        `DROP TABLE IF EXISTS ${tableName}`,
    );
    return res;
};

export async function addColumn(columnName, dataType) {
    let res = await client.query(
        `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`,
    );
    return res;
};

export async function updateOpUrl(feedUrl, opUrl) {
    let res = await client.query(
        `UPDATE ${tableName} SET op_url = $2
        WHERE feed_url=$1`,
        [feedUrl, opUrl]
    );
    return res;
};

export async function updateOpNodeVersion(feedUrl, opNodeVersion) {
    let res = await client.query(
        `UPDATE ${tableName} SET op_node_version = $2
        WHERE feed_url=$1`,
        [feedUrl, opNodeVersion]
    );
    return res;
};
