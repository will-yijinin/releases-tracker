require("dotenv/config");
const rss = require("./rss");
const express = require("express");
const { main, addFeed, deleteFeed, updateOpUrl } = require("./routes");
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 8000;

app.post("/add/feed", [
	addFeed
]);

app.post("/delete/feed", [
	deleteFeed
]);

app.post("/update/opurl", [
	updateOpUrl
]);

rss.init().then(() => {
  	console.log("Connected to db");

	// running a task every: dev - 1 minute, prod - 10 minutes
	const timeRange = process.env.NODE_ENV="development" ? "1" : "10";
	console.log(timeRange)
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

