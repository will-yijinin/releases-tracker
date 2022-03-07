import * as db from "../services/db";
import * as requests from "../services/requests";
import concat from "concat-stream";

module.exports = app => {
	app.get("/list/subscriptions", [
		listSubscriptions
	]);

	app.post("/add/feed", [
		addFeed
	]);
	
	app.post("/delete/feed", [
		deleteFeed
	]);
	
	app.post("/update/nodeversion", [
		updateOpNodeVersion
	]);

	app.post("/update/nodefullname", [
		updateNodeFullName
	]);
};


async function listSubscriptions(_, res: any){
	try{
		const subscriptions = await db.listSubscriptions();
		res.send(subscriptions);
	}catch(error: any){
		res.send(error);
	}
};

async function addFeed(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let { larkUrl, feedUrls } = JSON.parse(data.toString());
			try{
				for(let i=0; i<feedUrls.length; i++){
					const {feedUrl, nodeName} = feedUrls[i];
					// 若是非法地址，无法获取feed，抛错404
					await requests.getRssFeed(feedUrl);
					await db.subscribe(feedUrl, larkUrl, nodeName);
				}
				res.send({code:200, message:"success"});
			}catch(error: any){
				let code = error.code;
				let msg: string;
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

async function deleteFeed(req: any, res: any){
	req.pipe(
		concat(async data => {
			let { feedUrls } = JSON.parse(data.toString());
			res.send({code:200, message:"success", data: feedUrls});
		})
	);
};

async function updateOpNodeVersion(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let updates = JSON.parse(data.toString());
			try{
				// 更新status
				const criteria = updates.map((ele, index)=>{
					if(index===updates.length-1){
						return `'${ele.nodeName}'`;
					}
					return `'${ele.nodeName}', `;
				})?.join("");
				// 找到数据库中对应这次更新的运维节点的链列表
				const subscriptions: any = await db.filterSubscriptions(criteria);
				const updateStatusQueue: any = [];
				subscriptions.forEach(oldOne=>{
					const newOne = updates.find(ele=>ele.nodeName===oldOne.node_name);
					// 如果新的运维节点版本等于数据库中github节点版本，则修改状态为SAME
					if(newOne.nodeVersion===oldOne.github_node_version){
						updateStatusQueue.push({nodeName: newOne.nodeName, status: "SAME"});
					}
				});
				await db.updateStatus(updateStatusQueue);

				// 更新节点版本
				await db.updateOpNodeVersion(updates);

				// 返回成功
				res.send({code:200, message:"success"});

			}catch(error: any){
				res.send(error);
			}
		})
	);
};

async function updateNodeFullName(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let updates = JSON.parse(data.toString());
			try{
				await db.updateNodeFullName(updates);
				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send(error);
			}
		})
	);
};

