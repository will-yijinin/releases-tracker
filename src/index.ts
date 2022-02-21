require("dotenv/config");
const rss = require("./rss");
const express = require("express");
const { main, addFeed } = require("./routes");
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 8000;

app.post("/add/feed", [
	addFeed
]);

rss.init().then(() => {
  	console.log("Connected to db");

	// 每隔10分钟循环从数据库中获取列表
	cron.schedule('*/10 * * * *', () => {
		// running a task every ten minutes
		main();
	});

	app.listen(port, () => {
		console.log("Started Server...");
		console.log(`Listening on http://127.0.0.1:${port}`);
	});
}).catch((e) => {
	console.log(e);
});

