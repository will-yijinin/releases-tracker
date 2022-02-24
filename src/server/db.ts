const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('releases');

const tableName = "releases";

/**
 * 数据库表结构：
 * feed_url: TEXT
 * feed_url_type: TEXT, "NODE", "JS"
 * lark_url: TEXT
 * current_feed: TEXT
 * github_node_version: TEXT, github节点版本
 * op_node_version: TEXT, 运维节点版本
 */

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

async function db_select(query, params?){
    return new Promise(function(resolve,reject){
        db.all(query, params || [], function(err, res){
            if(err){
                return reject(err);
            }
            resolve(res);
        });
    });
};

export async function init(){
    // db.serialize(function() {});
    // db.run does not return any result
    await db_run(
        `CREATE TABLE IF NOT EXISTS ${tableName} (
            feed_url TEXT PRIMARY KEY,
            feed_url_type TEXT,
            lark_url TEXT,
            current_feed TEXT,
            github_node_version TEXT,
            op_node_version TEXT
        )`
    );
}

export async function listSubscriptions() {
    const rows = await db_select(
        `SELECT * FROM ${tableName}`
    );
    return rows;
};

export async function subscribe(feedUrl, feedUrlType, larkUrl) {
    if(!feedUrl || !feedUrlType || !larkUrl) throw Error("缺少入参");
    const res = await db_run(
        `INSERT INTO ${tableName}(feed_url, feed_url_type, lark_url) VALUES (?, ?, ?)`,
        [feedUrl, feedUrlType, larkUrl]
    );
    return res;
};

export async function unSubscribe(feedUrl) {
    const res = await db_run(
        `DELETE FROM ${tableName} WHERE feed_url=?`,
        [feedUrl]
    );
    return res;
};

export async function updateCurrentFeed(feedUrl, updateFeed, githubNodeVersion) {
    const res = await db_run(
        `UPDATE ${tableName} SET current_feed = ?, github_node_version = ?
        WHERE feed_url=?`,
        [JSON.stringify(updateFeed), githubNodeVersion, feedUrl]
    );
    return res;
};

// TODO: 更新运维节点版本
export async function updateOpNodeVersion(feedUrl, opNodeVersion) {
    const res = await db_run(
        `UPDATE ${tableName} SET op_node_version = ?
        WHERE feed_url=?`,
        [opNodeVersion, feedUrl]
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
