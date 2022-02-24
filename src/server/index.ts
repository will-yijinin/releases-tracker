require("dotenv/config");
const db = require("./db");
const express = require("express");
const { main, addFeed, deleteFeed, updateOpNodeVersion } = require("./controllers");
const cron = require('node-cron');

// TODO: ts语法，interface，变量类型
// TODO: ui: material ui
// TODO: next.js
// TODO: auth中间件
// TODO: 竞品的公告网站
const app = express();
const port = process.env.PORT || 8000;

app.post("/add/feed", [
	addFeed
]);

app.post("/delete/feed", [
	deleteFeed
]);

app.post("/update/nodeversion", [
	updateOpNodeVersion
]);

db.init().then(() => {
  	console.log("Connected to db");

	// running a task every: dev - 1 minute, prod - 10 minutes
	const timeRange = process.env.NODE_ENV==="development" ? "1" : "10";

	// TODO: job单独一个app，和server分离
	cron.schedule(`*/${timeRange} * * * *`, async () => {
		// 生产: 每隔10分钟循环从数据库中获取列表
		await main();
	});

	app.listen(port, () => {
		console.log("Started Server...");
		console.log(`Listening on http://127.0.0.1:${port}`);
	});
}).catch((e) => {
	console.log(e);
});

