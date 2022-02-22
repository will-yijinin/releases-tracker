const axios = require("axios");
const rss = require("./rss.ts");
const concat = require("concat-stream");

export async function main() {

	const feedList = await rss.listSubscriptions();
	// console.log(feedList)

	for (let i = 0; i < feedList.length; i++) {
		const { feed_url, lark_url, newest_feed } = feedList[i];

		// 根据列表，http请求获取最新feeds
		const fetchedFeeds = await rss.getRssFeed(feed_url);
		// console.log(fetchedFeeds)

		// 将获取的数据与数据库中的数据进行比较，如果有不同，更新数据库中的数据。同时记录上次发送请求的时间
		const updatedFeeds: any[] = [];
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
};

export async function addFeed(req, res){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let { larkUrl, feedUrls } = JSON.parse(data.toString());
			try{
				for(let i=0; i<feedUrls.length; i++){
					const feedUrl = feedUrls[i];
					// 若是非法地址，无法获取feed，抛错404
					await rss.getRssFeed(feedUrl);
					await rss.subscribe(feedUrl, larkUrl);
				}
				res.send({code:200, message:"success"});
			}catch(error: any){
				let code = error.code;
				let msg;
				switch(code){
					case "23505":
						msg = error.detail;
						break;
					default:
						msg = error;
				}
				if(error.message.includes("404")){
					code = "404";
					msg = "无法保存该订阅，请检查链接是否正确";
				}
				res.send({code, message: msg});
			}
		})
	);
};
