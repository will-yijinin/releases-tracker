const axios = require("axios");
const rss = require("./rss.ts");
const concat = require("concat-stream");

export async function main() {

	const subscriptions = await rss.listSubscriptions();
	// console.log(subscriptions);

	for (let i = 0; i < subscriptions.length; i++) {
		const { feed_url, lark_url, newest_feed } = subscriptions[i];

		// 根据列表，http请求获取最新feeds
		const fetchedFeeds = await rss.getRssFeed(feed_url);
		// console.log(fetchedFeeds);

		const updatedFeeds: any[] = [];
		// 如果数据库中的newest_feed字段不存在，说明是新的subscription，只推送最近一条更新即可
		if(!newest_feed){
			updatedFeeds.push(fetchedFeeds?.items?.[0]);
		}else{
			// 将获取的数据与数据库中的newest_feed进行比较，记录不同的feeds
			for(let j=0; j<fetchedFeeds?.items?.length; j++){
				const item = fetchedFeeds?.items?.[j];
				const newestFeedId = JSON.parse(newest_feed)?.id;
				if(newestFeedId!==item?.id){
					updatedFeeds.push(item);
				}else{
					break;
				}
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
			const updateFeed = updatedFeeds[0];
			const array = updateFeed?.link?.split("/");
			let nodeVersion = array?.[array?.length-1];
			if(nodeVersion.substring(0,1).toLowerCase()==="v"){
				nodeVersion = nodeVersion.substring(1);
			}

			rss.changeNewestFeed(feed_url, updateFeed, nodeVersion);
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

export async function deleteFeed(req, res){
	req.pipe(
		concat(async data => {
			let { feedUrls } = JSON.parse(data.toString());
			res.send({code:200, message:"success", data: feedUrls});
		})
	);
};
