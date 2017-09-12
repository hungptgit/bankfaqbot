'use strict';
const request = require('request');
const crypto = require('crypto');

class FBeamer {
	constructor(config) {
		try {
			if(!config || config.PAGE_ACCESS_TOKEN === undefined || config.VERIFY_TOKEN === undefined || config.APP_SECRET === undefined) {
				throw new Error("Unable to access tokens!");
			} else {
				this.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;
				this.VERIFY_TOKEN = config.VERIFY_TOKEN;
				this.APP_SECRET = config.APP_SECRET;
			}
		} catch(e) {
			console.log(e);
		}
	}

	registerHook(req, res) {
		// If req.query.hub.mode is 'subscribe'
		// and if req.query.hub.verify_token is the same as this.VERIFY_TOKEN
		// then send back an HTTP status 200 and req.query.hub.challenge
		let {
			mode, 
			verify_token, 
			challenge
		} = req.query.hub;

		if(mode === 'subscribe' && verify_token === this.VERIFY_TOKEN) {
			return res.end(challenge);
		} else {
			console.log("Could not register webhook!");
			return res.status(403).end();
		}
	}

	verifySignature(req, res, next) {
		if(req.method === 'POST') {
			let signature = req.headers['x-hub-signature'];
			try {
				if(!signature) {
					throw new Error("Signature missing!");
				} else {
					let hmac = crypto.createHmac('sha1', this.APP_SECRET);
					let ourSignature = `sha1=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;
					
					console.log(' >>>>> ourSignature: ' + ourSignature);
					console.log(' >>>>> signature: ' + signature);
					
					let bufferA = Buffer.from(ourSignature, 'utf8');
					//let bufferB = Buffer.from(signature, 'utf8');
					
					//let hash = crypto.createHmac('sha1', this.APP_SECRET).update(JSON.stringify(req.body)).digest('hex');
					try {
						//if(hash !== signature.split("=")[1]) {
						/*if(!bufferA.equals(bufferB)) {
							console.log(' >>>>> bufferA: ' + bufferA);
							console.log(' >>>>> bufferB: ' + bufferB);
							throw new Error("Invalid Signature");
						}
						else {
							//console.log(' >>>>> Valid Signature <<<<< ');
						}
						*/
						let bufferB = Buffer.from(signature, 'utf8');
					} catch(e) {
							console.log('verifySignature: ' + e);
							res.send(500, e);
					}
				}
			} catch(e) {
				console.log('verifySignature 1: ' + e);
				res.send(500, e);
			}
		} 

		return next();

	}

	subscribe() {
		request({
			uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST'
		}, (error, response, body) => {
			if(!error && JSON.parse(body).success) {
				console.log("Subscribed to the page!");
			} else {
				console.log('subscribe: ' + error);
			}
		});
	}
	
	getProfile(id) {
		return new Promise((resolve, reject) => {
			request({
				uri: `https://graph.facebook.com/v2.7/${id}`,
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'GET'
			}, (error, response, body) => {
				if(!error && response.statusCode === 200) {
					resolve(JSON.parse(body));
				} else {
					reject(error);
				}
			});
		});
	}
	
	incoming(req, res, cb) {
		
		// Extract the body of the POST request
		let data = req.body;
		//console.log('>>>>> req: ' + req);
		console.log('>>>>> incoming: ' + JSON.stringify(data));
		
		if(data.object === 'page') {
			// Iterate through the page entry Array
			data.entry.forEach(pageObj => {
				// Iterate through the messaging Array
				pageObj.messaging.forEach(msgEvent => {
					let messageObj = {
						sender: msgEvent.sender.id,
						timeOfMessage: msgEvent.timestamp,
						message: msgEvent.message || undefined,
						postback: msgEvent.postback || undefined 
					}
					
					cb(messageObj);
				});
			});
		}
		res.send(200);
	}

	sendMessage(payload) {
		return new Promise((resolve, reject) => {
			// Create an HTTP POST request
			request({
				uri: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'POST',
				json: payload
			}, (error, response, body) => {
				if(!error && response.statusCode === 200) {
					resolve({
						messageId: body.message_id
					});
				} else {
					console.log('>>>>>>>>>> sendMessage err: ' + error);
					reject(error);
				}
			});
		});
	}
	
	sendNews(payload) {
		return new Promise((resolve, reject) => {
			// Create an HTTP POST request
			request({
				uri: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'POST',
				json: true,
				body: payload
			}, (error, response, body) => {
				if(!error && response.statusCode === 200) {
					resolve({
						messageId: body.message_id
					});
				} else {
					console.log('>>>>>>>>>> sendNews err: ' + error);
					reject(error);
				}
			});
		});
	}
	
	// Show Persistent Menu
	showPersistent(payload) {
		/*
		let obj = {
			setting_type: "call_to_actions",
			thread_state: "existing_thread",
			call_to_actions: payload
		}
		*/
		console.log('showPersistent: ' + JSON.stringify(payload));
		
		request({
			uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST',
			json: payload
		}, (error, response) => {
			if(!error && response.statusCode === 200) {
				console.log('showPersistent result:' + JSON.stringify(response.body));
			}
			else {
				console.log('showPersistent error:' + JSON.stringify(response.body));
			}
		});
	}
	
	// Send a text message
	txt(id, text) {
		let obj = {
			recipient: {
				id
			},
			message: {
				text
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log('txt: ' + error));
	}

	// Send an image message
	img(id, url) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'image',
					payload: {
						url
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log('img: ' + error));
	}
	
	news(id, data) {
  	//var queryUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=extracts&exintro&explaintext&exsentences=5&exlimit=max&gsrsearch=" + query;
		
		let obj = {
			recipient: {
				id: id
			},
			message: {
				attachment: {
					type: "template",
					payload: {
						template_type: "generic",
						elements:[
								 {
									title:"VietinBank SME Club: Sự đón nhận từ cộng đồng doanh nghiệp",
									image_url:"http://cafefcdn.com/thumb_w/650/2017/vtb-1482312845555-1491215019360.jpg",
									subtitle:"Vừa ra mắt trong tháng 7/2017, VietinBank SME Club - Câu lạc bộ các thành viên là khách hàng doanh nghiệp vừa và nhỏ (SME) đã nhận được những lời ngợi khen từ khách hàng...",
									default_action: {
										type: "web_url",
										url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html"
										//messenger_extensions: true,
										//webview_height_ratio: "tall",
										//fallback_url: "https://ebanking.vietinbank.vn/rcas/portal/web/retail/bflogin"
									},
									buttons:[
										{
											type:"web_url",
											url:"http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
											title:"Xem chi tiết"
										},{
											type:"postback",
											title:"Đăng ký nhận tin",
											payload:"NEWS_BOT"
										}              
									]      
								}
								,
								{
									title:"VietinBank tuyển dụng gần 300 nhân sự cho chi nhánh",
									image_url:"https://thebank.vn/uploads/2014/03/Vietinbank-tuyen-dung.jpg",
									subtitle:"Đáp ứng yêu cầu nhân sự cho chiến lược phát triển, Ngân hàng TMCP Công Thương Việt Nam (VietinBank) tuyển dụng gần 300 chỉ tiêu tại các vị trí nghiệp vụ và hỗ trợ tín dụng cho các chi nhánh trên toàn hệ thống...",
									default_action: {
										type: "web_url",
										url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
										//messenger_extensions: true,
										//webview_height_ratio: "tall",
										//fallback_url: "https://peterssendreceiveapp.ngrok.io/"
									},
									buttons:[
										{
											type:"web_url",
											url:"https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
											title:"Xem chi tiết"
										},{
											type:"postback",
											title:"Đăng ký nhận tin",
											payload:"NEWS_BOT"
										}              
									]    
								}
								,
								{
									title:"VietinBank SME Club: Sự đón nhận từ cộng đồng doanh nghiệp",
									image_url:"http://image.bnews.vn/MediaUpload/Medium/2017/05/04/090646-bo-nhan-dien-thuong-hieu-vietinbank-2017-1.jpg",
									subtitle:"Vừa ra mắt trong tháng 7/2017, VietinBank SME Club - Câu lạc bộ các thành viên là khách hàng doanh nghiệp vừa và nhỏ (SME) đã nhận được những lời ngợi khen từ khách hàng...",
									default_action: {
										type: "web_url",
										url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
										//messenger_extensions: true,
										//webview_height_ratio: "tall",
										//fallback_url: "https://peterssendreceiveapp.ngrok.io/"
									},
									buttons:[
										{
											type:"web_url",
											url:"http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
											title:"Xem chi tiết"
										},{
											type:"postback",
											title:"Đăng ký nhận tin",
											payload:"NEWS_BOT"
										}              
									]    
								}
							]
						}
					}
				}
			}
		
	console.log('--> news data: ' + JSON.stringify(obj))	;
							
	this.sendNews(obj)
			.catch(error => console.log('news: ' + error));
}
	
newsKM(id, data) {
  	//var queryUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=extracts&exintro&explaintext&exsentences=5&exlimit=max&gsrsearch=" + query;
		
		let obj = {
			recipient: {
				id: id
			},
			message: {
				attachment: {
					type: "template",
					payload: {
						template_type: "generic",
						elements:[
								 {
									title:"Hoàn 15% cho chủ thẻ tín dụng quốc tế VietinBank tại Lotte Mart",
									image_url:"http://cafefcdn.com/thumb_w/650/2017/vtb-1482312845555-1491215019360.jpg",
									subtitle:"Chào mừng ngày lễ lớn của đất nước, VietinBank triển khai Chương trình Khuyến mãi tưng bừng - chào mừng Quốc khánh",
									default_action: {
										type: "web_url",
										url: "http://www.vietinbank.vn/vn/tin-tuc/Hoan-15-cho-chu-the-tin-dung-quoc-te-VietinBank-tai-Lotte-Mart-20170829154910.html"
										//messenger_extensions: true,
										//webview_height_ratio: "tall",
										//fallback_url: "https://ebanking.vietinbank.vn/rcas/portal/web/retail/bflogin"
									},
									buttons:[
										{
											type:"web_url",
											url:"http://www.vietinbank.vn/vn/tin-tuc/Hoan-15-cho-chu-the-tin-dung-quoc-te-VietinBank-tai-Lotte-Mart-20170829154910.html",
											title:"Xem chi tiết"
										},{
											type:"web_url",
											title:"Đăng ký mở thẻ",
											payload:"NEWS_BOT"
										}              
									]      
								}
								,
								{
									title:"Western Union - Nhận tiền - Trúng thưởng",
									image_url:"https://thebank.vn/uploads/2014/03/Vietinbank-tuyen-dung.jpg",
									subtitle:"Từ 1/9/2017 - 31/12/2017, VietinBank tổ chức chương trình khuyến mãi dịch vụ ABMT: “Western Union - Nhận tiền - Trúng thưởng”. Chương trình được tổ chức để tri ân khách hàng...",
									default_action: {
										type: "web_url",
										url: "https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
										//messenger_extensions: true,
										//webview_height_ratio: "tall",
										//fallback_url: "https://peterssendreceiveapp.ngrok.io/"
									},
									buttons:[
										{
											type:"web_url",
											url:"https://www.vietinbank.vn/vn/tin-tuc/VietinBank-tuyen-dung-gan-300-nhan-su-cho-chi-nhanh-20170807233640.html",
											title:"Xem chi tiết"
										},{
											type:"postback",
											title:"Đăng ký nhận tin",
											payload:"NEWS_BOT"
										}              
									]    
								}
							]
						}
					}
				}
			}
		
	console.log('--> news data: ' + JSON.stringify(obj))	;
							
	this.sendNews(obj)
			.catch(error => console.log('news: ' + error));
}	
	
newsSP(id, data) {
  	//var queryUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=extracts&exintro&explaintext&exsentences=5&exlimit=max&gsrsearch=" + query;
		
		let obj = {
			recipient: {
				id: id
			},
			message: {
				attachment: {
					type: "template",
					payload: {
						template_type: "generic",
						elements:[
								 {
									title:"VietinBank là ngân hàng duy nhất phát hành thẻ Diners Club tại Việt Nam",
									image_url:"http://baochinhphu.vn/Uploaded/nguyenvanhuan/2017_09_12/119%20Vietin%20k%C3%BD%20DSC_1247.jpg",
									subtitle:"Ngày 11/9/2017 tại Hà Nội, VietinBank tổ chức Lễ ký kết Hợp đồng hợp tác toàn diện với Tổ chức thẻ Diners Club International (DCI). Với thỏa thuận này, VietinBank sẽ là ngân hàng độc quyền trong việc phát hành dòng sản phẩm thẻ Diners Club tại thị trường Việt Nam...",
									default_action: {
										type: "web_url",
										url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-la-ngan-hang-duy-nhat-phat-hanh-the-Diners-Club-tai-Viet-Nam-20170912084406.html"
										//messenger_extensions: true,
										//webview_height_ratio: "tall",
										//fallback_url: "https://ebanking.vietinbank.vn/rcas/portal/web/retail/bflogin"
									},
									buttons:[
										{
											type:"web_url",
											url:"http://www.vietinbank.vn/vn/tin-tuc/VietinBank-la-ngan-hang-duy-nhat-phat-hanh-the-Diners-Club-tai-Viet-Nam-20170912084406.html",
											title:"Xem chi tiết"
										},{
											type:"web_url",
											title:"Đăng ký mở thẻ",
											url:"https://www.vietinbank.vn/web/home/vn/product/dang-ky-truc-tuyen.html"
										}              
									]      
								}
								,
								{
									title:"VietinBank thu hộ tiền vé máy bay cho Jetstar Pacific Airlines",
									image_url:"http://vemaybaygiarevietmy.com/image/data/hang-hang-khong/jetstar-pacific-airlines/bl-ve-may-bay-jetstar-pacific-gia-re01.png",
									subtitle:"Từ ngày 21/8/2017, VietinBank cung cấp dịch vụ thu hộ tiền vé máy bay dành cho các Đại lý của Jetstar Pacific Airlines (JPA) và các khách hàng đã đặt chỗ thành công trên hệ thống JPA",
									default_action: {
										type: "web_url",
										url: "http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
										//messenger_extensions: true,
										//webview_height_ratio: "tall",
										//fallback_url: "https://peterssendreceiveapp.ngrok.io/"
									},
									buttons:[
										{
											type:"web_url",
											url:"http://www.vietinbank.vn/vn/tin-tuc/VietinBank-SME-Club-Su-don-nhan-tu-cong-dong-doanh-nghiep-20170909135227.html",
											title:"Xem chi tiết"
										},{
											type:"postback",
											title:"Mua vé máy bay",
											payload:"menu:PAY_ELECTRIC"
										}              
									]    
								}
							]
						}
					}
				}
			}
		
	console.log('--> news data: ' + JSON.stringify(obj))	;
							
	this.sendNews(obj)
			.catch(error => console.log('news: ' + error));
}	

acctInfo(id, data) {
  	
		let obj = {
			recipient: {
				id: id
			},
			message: {
				attachment: {
					type: "template",
					payload: {
						template_type: "generic",
						elements:[
								 {
									title:"DDA: 1010*****312323 TRAN SON TUNG",
									image_url:"https://thebank.vn/uploads/posts/228/thebank.vn-tienichvuottroicuatheatmvietinbankpepartner-1408694398.jpg",
									subtitle:"Trạng thái: Active,\n Số dư khả dụng: 3,123,567 đ, \n ",
									buttons:[
										{ type:"postback",
											title:"Xem sao kê",
											payload:"menu:MNSTMT_PAYLOAD"
										},{
											type:"postback",
											title:"Chuyển khoản",
											payload:"menu:XFER_PAYLOAD"
										},{
											type:"postback",
											title:"Thanh toán",
											payload:"menu:PAYMENT_PAYLOAD"
										}               
									]      
								}
								,
								{
									title:"DDA: 1010*****312556 TRAN SON TUNG",
									image_url:"https://thebank.vn/uploads/posts/228/thebank.vn-tienichvuottroicuatheatmvietinbankpepartner-1408694398.jpg",
									subtitle:"Trạng thái: Closed,\n Số dư khả dụng: 0 đ, \n ",
									buttons:[
										{ type:"postback",
											title:"Xem sao kê",
											payload:"menu:MNSTMT_PAYLOAD"
										}              
									]      
								}
							]
						}
					}
				}
			}
		
	console.log('--> news data: ' + JSON.stringify(obj))	;
							
	this.sendNews(obj)
			.catch(error => console.log('news: ' + error));
}
		
	
	// A button
	btn(id, data) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'button',
						text: data.text,
						buttons: data.buttons
					}
				}
			}
		}
		console.log('btn obj: ' + JSON.stringify(obj));
		
		this.sendMessage(obj)
			.catch(error => console.log('btn: ' + error));
	}

	// Quick Replies
	quick(id, data) {
		console.log('quick obj: ' + JSON.stringify(data));
		
		let obj = {
			recipient: {
				id
			},
			message: {
				text: data.text,
				quick_replies: data.buttons
			}
		}
		
		console.log('quick obj: ' + JSON.stringify(obj));
		
		this.sendMessage(obj)
			.catch(error => console.log('quick: ' + error));
	}

}

module.exports = FBeamer;
