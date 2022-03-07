import axios from "axios";
import * as requests from "./services/requests";
import cron from "node-cron"

// running a task every: dev - 1 minute, prod - 10 minutes
const timeRange = process.env.NODE_ENV==="development" ? "1" : "10";
const port = process.env.PORT || 8000;

cron.schedule(`*/${timeRange} * * * *`, async () => {
    // 生产: 每隔10分钟循环从数据库中获取列表
    await main();
});

// 更新当前feed_url最新的current_feed
async function updateCurrentFeed(feed_url: string, updateFeed: any){
	const array = updateFeed?.link?.split("/");
	let githubNodeVersion = array?.[array?.length-1];
	if(githubNodeVersion.substring(0,1).toLowerCase()==="v"){
		githubNodeVersion = githubNodeVersion.substring(1);
	}
	await axios.post(
		`http://127.0.0.1:${port}/update/feed`,
		{feedUrl: feed_url, updateFeed, githubNodeVersion},
	);
};

async function main() {

    const res = await axios.get(
		`http://127.0.0.1:${port}/list/subscriptions`
	);
	const subscriptions: any = res.data.data;
	console.log(subscriptions.length);

	for (let i = 0; i < subscriptions.length; i++) {
		const { feed_url, lark_url, current_feed } = subscriptions[i];

		// 根据列表，http请求获取最新feeds
		const fetchedFeeds: any = await requests.getRssFeed(feed_url);
		// console.log(fetchedFeeds);

		// 如果数据库中的current_feed字段不存在，说明是新的subscription，只更新current_feed即可
		if(!current_feed){
			// TODO: serialize otherwise when mass, some items missing. maybe batch send
			await updateCurrentFeed(feed_url, fetchedFeeds?.items?.[0]);
		}else{
			const updatedFeeds: any[] = [];

			// 将获取的数据与数据库中的current_feed进行比较，记录不同的feeds
			for(let j=0; j<fetchedFeeds?.items?.length; j++){
				const item = fetchedFeeds?.items?.[j];
				const currentFeedId = JSON.parse(current_feed)?.id;
				if(currentFeedId!==item?.id){
					console.log("currentFeedId: "+currentFeedId);
					updatedFeeds.push(item);
				}else{
					break;
				}
			}
			// console.log(updatedFeeds);

			// 如果有新的feeds
			if(updatedFeeds.length>0 && updatedFeeds[0]){
				// 发送新的数据到相应的lark channel
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

				await updateCurrentFeed(feed_url, updatedFeeds[0]);
			}
		}
	}
};
