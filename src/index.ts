require("dotenv/config");
const rss = require("./rss");
const express = require("express");
const { main, addFeed } = require("./routes");

// TODO: pm2 设置lifecycle management和自动重启。

const app = express();
const port = process.env.PORT || 8000;

app.get("/", [
	main,
]);

// TODO: route：新增feed subscription。POST，params：larkUrl，feedUrl
app.post("add/feed", [
	
]);

rss.init().then(() => {
  	console.log("Connected to db");
	app.listen(port, () => {
		console.log("Started Server...");
		console.log(`Listening on http://127.0.0.1:${port}`);
	});
}).catch((e) => {
	console.log(e);
});
