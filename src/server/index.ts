require("dotenv/config");
const db = require("./db");
const express = require("express");
const { addFeed, deleteFeed, updateOpNodeVersion } = require("./controllers");

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
	app.listen(port, () => {
		console.log("Started Server...");
		console.log(`Listening on http://127.0.0.1:${port}`);
	});
}).catch((e: Error) => {
	console.log(e);
});

