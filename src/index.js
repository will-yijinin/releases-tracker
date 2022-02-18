const axios = require("axios");
const http = require("http");
const rss = require("./rss.ts");
const { larkUrl } = require("./constants");

// TODO: route：新增feed subscription。POST，params：larkUrl，feedUrl

// pm2 设置lifecycle management和自动重启。
const app = http.createServer(async (request, response) => {
	await rss.init();

	// await rss.subscribe("https://github.com/solana-labs/solana/releases.atom", larkUrl);

	// TODO: 每隔10分钟循环从数据库中获取列表
	const feedList = await rss.listSubscriptions();
	// console.log(feedList)

	for (let i = 0; i < feedList.length; i++) {
		const { feed_url, lark_url, newest_feed } = feedList[i];

		// 根据列表，http请求获取最新feeds
		const fetchedFeeds = await rss.getRssFeed(feed_url);
		// console.log(fetchedFeeds)

		// 将获取的数据与数据库中的数据进行比较，如果有不同，更新数据库中的数据。同时记录上次发送请求的时间
		const updatedFeeds = [];
		for(let j=0; j<fetchedFeeds?.items?.length; j++){
			const item = fetchedFeeds?.items?.[j];
			// 如果newest_feed不存在，则说明第一次推送，只推送最近一条更新即可
			if(!newest_feed){
				updatedFeeds.push(item);
				break;
			}
			const newestFeedTitle = JSON.parse(newest_feed)?.title;
			if(newestFeedTitle!==item?.title){
				updatedFeeds.push(item);
			}else{
				break;
			}
		}
		// console.log(updatedFeeds)

		// 发送新的数据到相应的lark channel
		if(updatedFeeds.length>0 && updatedFeeds[0]){
			for(let k=updatedFeeds.length-1; k>=0; k--){
				const response = await axios.post(
					lark_url,
					{
						"msg_type": "post",
						"content": {
							"post": {
								"zh_cn": {
									"title": fetchedFeeds.title,
									"content": [
										[
											{
												"tag": "a",
												"text": updatedFeeds[k].title,
												"href": updatedFeeds[k].link,
											},
										],
										[
											{
												"tag": "text",
												"text": new Date(updatedFeeds[k].pubDate).toLocaleString(),
											},
										],
										[
											{
												"tag": "text",
												"text": "",
											},
										],
										[
											{
												"tag": "text",
												"text": updatedFeeds[k].contentSnippet
											}
										]
									]
								}
							}
						}
					}
				);
				console.log(response.data)
			}

			// 更新当前feed_url最新的newest_feed
			rss.changeNewestFeed(feed_url, updatedFeeds[0]);
		}
	}
});

console.log("Started Server...")
const port = process.env.PORT || 8000;
app.listen(port);
console.log(`Listening on http://127.0.0.1:${port}`);
