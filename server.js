'use strict';
// create an API server
const config = require('./config');
const Restify = require('restify');
const server = Restify.createServer({
	name: 'VTBMessenger'
});
const PORT = process.env.PORT || 3000;
// FBeamer
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);

server.use(Restify.jsonp());
server.use(Restify.bodyParser());
server.use((req, res, next) => f.verifySignature(req, res, next));

// Agenda
const agenda = require('./agenda')(f);
const vtb = require('./vtb');

// Wit.ai
const Wit = require('node-wit').Wit;
const wit = new Wit({
	accessToken: config.WIT_ACCESS_TOKEN
});

// OMDB
//const intents = require('./intents');

const {firstEntity, fetchEntity} = require('./utils');


// Register the webhooks
server.get('/', (req, res, next) => {
	//console.log("receive get:" );
	f.registerHook(req, res);
	return next();
});


agenda.on('ready', () => {
	// Handle incoming
	server.post('/', (req, res, next) => {
		f.incoming(req, res, msg => {
			let {
				sender,
				postback,
				message
			} = msg;
			
			let buttons = '';
			let text = '';
			let data = '';
			
			console.log('----> msg : ' + JSON.stringify(msg));
			
			if (postback && postback.payload) {
				console.log('postback.payload :' + postback.payload);
				
				switch(postback.payload) {
					case 'GET_STARTED_PAYLOAD':
						f.getProfile(sender)
							.then(profile => {
								const {first_name, timezone} = profile;
								console.log('getProfile: ' + first_name);
								f.txt(sender, 'Xin chào ' + first_name + ' ❤️ \nChúc bạn một ngày tốt lành! \nHãy lựa chọn các tính năng trên Menu hoặc gõ Xem so du, Chuyen khoan, Gui tiet kiem. ');
							})
							.catch(error => {
								console.log('getProfile err: ' +error);
								f.txt(sender, 'Xin chào bạn ❤️ \nChúc bạn một ngày tốt lành! \nHãy lựa chọn các tính năng trên Menu hoặc gõ Xem so du, Chuyen khoan, Gui tiet kiem. ');
							});
						
							data = {
										text: 'Nếu chưa đăng ký dịch vụ VietinBank FinBot bạn có thể bắt đầu',
										buttons: [{
												type: 'web_url',
												title: 'Đăng ký FinBot',
												url: 'http://hungpt.handcraft.com/index.html?fbid='+sender
											}				
										]
									}
								console.log('dangkydichvu button data: ' + JSON.stringify(data));
								f.btn(sender, data);
						break;
					case 'menu:INQ_BALANCE_PAYLOAD':
						f.acctInfo(sender, 'Ban muon van tin so du tai khoan');
						break;	
					case 'menu:XFER_PAYLOAD':
						f.txt(sender, 'Bạn hãy gõ Lệnh chuyển tiền theo cú pháp: Chuyen <So tien> toi <So tai khoan> tai <Ma ngan hang> \n VD: chuyen 1000000 toi 462879758937 tai VCB');
						break;
					case 'menu:REG_PAYLOAD':
						data = {
								text: 'Bạn muốn đăng ký dịch vụ nào của VietinBank?',
								buttons: [{
										type: 'web_url',
										title: 'FinBot',
										url: 'http://hungpt.handcraft.com/index.html?fbid='+sender
									},
									{
										type: 'web_url',
										title: 'iPay',
										url: 'https://www.vietinbank.vn/web/home/vn/product/dang-ky-truc-tuyen.html'
									},
									{
										type: 'postback',
										title: 'eFAST',
										payload: 'REG_EFAST'
									}				
								]
							}
						console.log('dangkydichvu button data: ' + JSON.stringify(data));
						f.btn(sender, data);

						break;	
					case 'menu:PAY_ELECTRIC':
						f.txt(sender, 'Bạn hãy gõ Lệnh thanh toán theo cú pháp: Thanh toan <So tien> cho <Ma hoa don/Ma khach hang/So ve> dich vu <Ma dich vu> \n VD: TT 1000000 cho EVN3278947 dich vu EVN');
						break;
					case 'menu:PAY_WARTER':
						f.txt(sender, 'Ban muon thanh toan hoa don tien nuoc');
						break;
					case 'menu:NEWS_PAYLOAD':
						f.news(sender, 'News Feed service');
						
						break;
					case 'menu:PAY_ISSURANCE':
						f.txt(sender, 'Ban muon thanh toan bao hiem');
						break;	
					case 'menu:SAVING_PAYLOAD':
						 buttons = 
							[
								{
									content_type:"text",
									title:"3 tháng",
									image_url:"http://www.freeiconspng.com/uploads/dollar-sign-icon-png-22.png",
									payload:"SAVE_3M"
								},
								{
									content_type:"text",
									title:"6 tháng",
									image_url:"http://www.freeiconspng.com/uploads/dollar-sign-icon-png-22.png",
									payload:"SAVE_6M"
								},
								{
									content_type:"text",
									title:"12 tháng",
									image_url:"http://www.freeiconspng.com/uploads/dollar-sign-icon-png-22.png",
									payload:"SAVE_12M"
								}
							];
						text = 'Bạn dự định gửi tiết kiệm kỳ hạn nào?';
						
						f.quick(sender, {text, buttons});
						
						//f.txt(sender, 'Ban tham khao bieu lai suat gui tiet kiem cho cac ky han tai website VietinBank. Ban muon gui tiet kiem ky han nao? 1 thang - 2 thang - 3 thang - 6 thang - 9 thang - 12 thang');
						break;
					case 'menu:LOCATION_PAYLOAD':
						
						 buttons = 
							[
							
								{
									content_type:"location"
								}
							];
						text = 'Bạn muốn tìm các phòng giao dịch ở quanh khu vực nào';
						
						f.quick(sender, {text, buttons});
						
						//f.txt(sender, 'Ban tham khao bieu lai suat gui tiet kiem cho cac ky han tai website VietinBank. Ban muon gui tiet kiem ky han nao? 1 thang - 2 thang - 3 thang - 6 thang - 9 thang - 12 thang');
						break;	
					case 'NEWS_BOT':
						buttons = 
							[
								{
									content_type:"text",
									title:"08:30",
									image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
									payload:"NEWS_8h30"
								},
								{
									content_type:"text",
									title:"11:00",
									image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
									payload:"NEWS_11h"
								},
								{
									content_type:"text",
									title:"16:30",
									image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
									payload:"NEWS_16h30"
								}
							];
						text = 'Bạn đăng ký nhận tin mới từ VietinBank vào thời điểm?';
						
						//console.log('quickClock data:' + JSON.stringify(quickData));
						f.quick(sender, {text, buttons});
						
						//f.txt(sender, 'Ban tham khao bieu lai suat gui tiet kiem cho cac ky han tai website VietinBank. Ban muon gui tiet kiem ky han nao? 1 thang - 2 thang - 3 thang - 6 thang - 9 thang - 12 thang');
						break;	
						
					case 'REG_EFAST':
						f.txt(sender, 'Bạn đã đăng ký dịch vụ cho KHDN');
						break;
					
						
						
					default:
						f.txt(sender, 'Ban hay lua chon tinh nang can dung. Choice showing');
						break;
				}
			}
			
			if (message && message.text && !message.quick_reply) {
				// Process the message here
				let messageTxt = message.text;

				console.log('messageTxt:' + messageTxt);
				// Wit's Message API
				wit.message(messageTxt)
					.then(({
						entities
					}) => {
						console.log('WIT resp:' + JSON.stringify(entities));
						let intent = firstEntity(entities, 'intent');
						if (!intent) {
							// use app data, or a previous context to decide how to 
							console.log('Not found intent');
							//f.txt(sender, 'Yeu cau cua ban da duoc ghi nhan. Thanks');
							return;
						}

						switch (intent.value) {
							case 'truyvantaikhoan':
								f.acctInfo(sender, 'Ban muon van tin so du tai khoan');
								break;
							case 'chuyenkhoan':
								let bankCode = firstEntity(entities, 'bankCode');
								let sotien = fetchEntity(entities, 'number');
								console.log(' >>>>>> sotien: ' + JSON.stringify(sotien));
								
								if(!sotien) {
									f.txt(sender, 'Bạn hãy gõ Lệnh chuyển tiền theo cú pháp: Chuyen <So tien> toi <So tai khoan> tai <Ma ngan hang> \n VD: chuyen 1000000 toi 462879758937 tai VCB');
								}	
								else
								{
									f.txt(sender, 'Bạn muốn chuyển ' + sotien.value +'  toi <So tai khoan> tai ' + bankCode.value + '. Đang chuyển bạn đến trang xác thực OTP...');
								}	
								break;
							case 'thanhtoanhoadon':
								f.txt(sender, 'Bạn hãy gõ Lệnh thanh toán theo cú pháp: Thanh toan <So tien> cho <Ma hoa don/Ma khach hang/So ve> dich vu <Ma dich vu> \n VD: TT 1000000 cho EVN3278947 dich vu EVN');
								break;	
							case 'timdiadiem':
								buttons = 
									[

										{
											content_type:"location"
										}
									];
								text = 'Bạn muốn tìm các phòng giao dịch ở quanh khu vực nào';

								f.quick(sender, {text, buttons});
								break;
							case 'tintucsukien':
								let newsType = firstEntity(entities, 'newsType');
								switch (true) {
									case (newsType.value == 'san pham dich vu'):	
										f.newsSP(sender, 'News Feed service');
										break;
									case (newsType.value == 'khuyen mai'):
										f.newsKM(sender, 'News Feed service');
										break;
									default:
										f.news(sender, 'News Feed service');
										break;
								}		
								break;	
							case 'guitietkiem':
								buttons = 
									[
										{
											content_type:"text",
											title:"3 tháng",
											image_url:"http://www.freeiconspng.com/uploads/dollar-sign-icon-png-22.png",
											payload:"SAVE_3M"
										},
										{
											content_type:"text",
											title:"6 tháng",
											image_url:"http://www.freeiconspng.com/uploads/dollar-sign-icon-png-22.png",
											payload:"SAVE_6M"
										},
										{
											content_type:"text",
											title:"12 tháng",
											image_url:"http://www.freeiconspng.com/uploads/dollar-sign-icon-png-22.png",
											payload:"SAVE_12M"
										}
									];
								text = 'Bạn dự định gửi tiết kiệm kỳ hạn nào?';

								f.quick(sender, {text, buttons});
								break;	
							case 'dangkydichvu':
								//f.txt(sender, 'Chuyen ban toi trang nhap thong tin dang ky dich vu...');
								data = {
										text: 'Bạn muốn đăng ký dịch vụ nào của VietinBank?',
										buttons: [{
												type: 'web_url',
												title: 'FinBot',
												url: 'http://hungpt.handcraft.com/index.html?fbid='+sender
											},
											{
												type: 'web_url',
												title: 'iPay',
												url: 'https://www.vietinbank.vn/web/home/vn/product/dang-ky-truc-tuyen.html'
											},
											{
												type: 'postback',
												title: 'eFAST',
												payload: 'REG_EFAST'
											}				
										]
									}
								console.log('dangkydichvu button data: ' + JSON.stringify(data));
								f.btn(sender, data);
								
								break;
							case 'tracuu':
								f.txt(sender, 'Danh sách bạn cần như sau');
								break;
							case 'xinchao':
								let greetings = firstEntity(entities, 'greetings');
								let bye = firstEntity(entities, 'bye');

								if(greetings) {
									f.getProfile(sender)
										.then(profile => {
											const {first_name, timezone} = profile;
											console.log('getProfile: ' + first_name);
											f.txt(sender, greetings.value + ' ' + first_name + ' ❤️');
										})
										.catch(error => {
											console.log('getProfile err: ' +error);
											f.txt(sender, greetings.value  + ' ❤️');
										});
									
								}
								
								if(bye) {
									f.getProfile(sender)
										.then(profile => {
											const {first_name, timezone} = profile;
											console.log('getProfile: ' + first_name);
											f.txt(sender, bye.value + ' ' + first_name + ' :) :D :( O:) :P ;) :O -_- >:O :* 8-) (y) ');
										})
										.catch(error => {
											console.log('getProfile err: ' +error);
											f.txt(sender, bye.value  + ' ❤️');
										});
									
								}
								break;
							case 'camon':
								f.txt(sender, 'Cảm ơn bạn đã sử dụng dịch vụ của VietinBank ^_^ ');
								break;	
							default:
								console.log(`?  ${intent.value}`);
								f.txt(sender, 'Okey! Ban muon thuc hien '+ intent.value);
								f.txt(sender, 'Data collected: '+ JSON.stringify(entities));
								break;
						}
					})
					.catch(error => {
						console.log(error);
						f.txt(sender, "Hmm. My servers are acting weird today! Try asking me again after a while.");
					});
			}
			
			if (message && message.quick_reply) {
				let quickReply = message.quick_reply;
				console.log('quickReply: ' + JSON.stringify(message.quick_reply));
				
				switch(quickReply.payload) {
					case 'SAVE_3M':
						f.txt(sender, 'Lãi suất gửi tiết kiệm 3 tháng tại VietinBank hiện đang là 4,3%');
						break;
					case 'SAVE_6M':
						f.txt(sender, 'Lãi suất gửi tiết kiệm 6 tháng tại VietinBank hiện đang là 5,3%');
						break;
					case 'SAVE_12M':	
						f.txt(sender, 'Lãi suất gửi tiết kiệm 12 tháng tại VietinBank hiện đang là 6,8%');
						break;
					case 'NEWS_16h30':
						f.txt(sender, 'Bạn đã đăng ký nhận tin thành công');
						break;	
					case 'NEWS_11h':
						f.txt(sender, 'Bạn đã đăng ký nhận tin thành công');
						break;	
					case 'NEWS_8h30':
						agenda.now('createReminder', {
							sender,
							datetime: context.datetime,
							task: context.task
						});
						f.txt(sender, 'Bạn đã đăng ký nhận tin thành công');
						break;		
					default:
						f.txt(sender, 'Data collected: '+ JSON.stringify(quickReply));
						break;		
				}
			}
			
			if (message && message.attachments) {
				console.log('message.attachments: ' + JSON.stringify(message.attachments));
				let locTitle = message.attachments[0].title;
				let coord = message.attachments[0].payload.coordinates;
				let locLat = coord.lat;
        let locLong = coord.long;
				f.txt(sender, 'Bạn đang ở gần địa điểm ' + locTitle + '(lat: ' + locLat + ', long: ' + locLong + '), quanh bạn có các PGD sau của VietinBank: [123 Xã Đàn] [15 Nam Đồng] [19 Tây Sơn]');
			}
		});
		
		return next();
	});

	agenda.start();
});

// Persistent Menu
f.showPersistent(
	{"persistent_menu":
	[{
	"locale":"default",
  "composer_input_disabled":false,
  "call_to_actions":[
			{
				"type": "postback",
				"title": "Xem số dư",
				"payload": "menu:INQ_BALANCE_PAYLOAD"
			},
			{
				"type": "postback",
				"title": "Chuyển khoản",
				"payload": "menu:XFER_PAYLOAD"
			},								
			{
				"title":"Dịch vụ khác",
        "type":"nested",
        "call_to_actions":[
            {
							"title":"Đăng ký dịch vụ",
              "type":"postback",
              "payload":"menu:REG_PAYLOAD"
						},
            {
              "title":"Gửi tiết kiệm",
              "type":"postback",
              "payload":"menu:SAVING_PAYLOAD"
            },
						{
							"title":"Thanh toán",
							"type":"postback",
							"payload":"menu:PAY_ELECTRIC"
						},
						{
							"title":"Thông tin",
							"type":"nested",
							"call_to_actions":[
									{
										"title":"Tin hot",
										"type":"postback",
										"payload":"menu:NEWS_PAYLOAD"
									},
									{
										"title":"Tìm quanh đây",
										"type":"postback",
										"payload":"menu:LOCATION_PAYLOAD"
									},
									{
										"title":"Tỷ giá, lãi suất",
										"type":"postback",
										"payload":"menu:PAY_WARTER"
									},
									{
										"type": "web_url",
										"title": "Hỗ trợ",
										"url": "http://vietinbank.vn/"
									}
          			]
							}
          ]
			}
		]},
    {
      "locale":"vi_VN",
      "composer_input_disabled":false
    }
  ]});

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`VietinBanker running on port ${PORT}`));