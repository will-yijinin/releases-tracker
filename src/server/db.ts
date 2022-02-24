const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('releases');

const tableName = "releases";

async function db_run(query, params?){
    return new Promise(function(resolve,reject){
        db.run(query, params || [], function(err){
            if(err){
                return reject(err);
            }
            resolve(null);
        });
    });
};

async function db_all(query, params?){
    return new Promise(function(resolve,reject){
        db.all(query, params || [], function(err, res){
            if(err){
                return reject(err);
            }
            resolve(res);
        });
    });
};

/**
 * 数据库表结构：
 * feed_url: String
 * lark_url: String
 * newest_feed: Feed
 * node_version: String github节点版本
 * op_node_version: String 运维节点版本
 */
 export async function init(){
    // db.serialize(function() {});
    // db.run does not return any result
    await db_run(
        `CREATE TABLE IF NOT EXISTS ${tableName} (
            feed_url TEXT PRIMARY KEY,
            lark_url TEXT,
            newest_feed TEXT,
            node_version TEXT,
            op_node_version TEXT
        )`
    );
}

export async function listSubscriptions() {
    const rows = await db_all(
        `SELECT * FROM ${tableName}`
    );
    return rows;
};

export async function subscribe(feedUrl, larkUrl) {
    const res = await db_run(
        `INSERT INTO ${tableName}(feed_url,lark_url) VALUES (${feedUrl} ${larkUrl})`
    );
    return res;
};

export async function unSubscribe(feedUrl) {
    const res = await db_run(
        `DELETE FROM ${tableName} WHERE feed_url=${feedUrl}`
    );
    return res;
};

export async function updateNewestFeed(feedUrl, newestFeed, nodeVersion) {
    console.log(feedUrl, newestFeed, nodeVersion)
    const res = await db_run(
        `UPDATE ${tableName} SET newest_feed = ${newestFeed}, node_version = ${nodeVersion}
        WHERE feed_url=${feedUrl}`,
    );
    return res;
};

// TODO
export async function updateOpNodeVersion(feedUrl, opNodeVersion) {
    const res = await db_run(
        `UPDATE ${tableName} SET op_node_version = ${opNodeVersion}
        WHERE feed_url=${feedUrl}`
    );
    return res;
};

export async function deleteTable(tableName) {
    const res = await db_run(
        `DROP TABLE IF EXISTS ${tableName}`
    );
    return res;
};

export async function addColumn(columnName, dataType) {
    const res = await db_run(
        `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`
    );
    return res;
};
