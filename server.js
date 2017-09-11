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

const {firstEntity} = require('./utils');


// Register the webhooks
server.get('/', (req, res, next) => {
	//console.log("receive get:" );
	f.registerHook(req, res);
	return next();
});


//agenda.on('ready', () => {
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
			
			
			
			console.log('----> msg : ' + JSON.stringify(msg));
			
			if (postback && postback.payload) {
				console.log('postback.payload :' + postback.payload);
				
				switch(postback.payload) {
					case 'GET_STARTED_PAYLOAD':
						f.getProfile(sender)
							.then(profile => {
								const {first_name, timezone} = profile;
								console.log('getProfile: ' + first_name);
								f.txt(sender, 'Xin chao ' + first_name + ' ❤️ .Chuc ban mot ngay tot lanh. Hay lua chon cac tinh nang');
							})
							.catch(error => {
								console.log('getProfile err: ' +error);
								f.txt(sender, 'Xin chao ❤️ .Chuc ban mot ngay tot lanh. Hay lua chon cac tinh nang');
							});
						
						//f.txt(sender, 'Xin chao ban! Chuc ban mot ngay tot lanh. Hay lua chon cac tinh nang');
						break;
					case 'menu:INQ_BALANCE_PAYLOAD':
						f.txt(sender, 'Ban muon van tin so du tai khoan: Tien gui? Tien vay ?');
						/*
						vtb(messageTxt, 'current')
							.then(response => {
								f.txt(sender, response);
							})
							.catch(error => {
								console.log("There seems to be a problem connecting to the acct inq service");
								f.txt(msg.sender, "Co van de khi ket noi den dich vu ngan hang :(");
							});
						*/	
						break;	
					case 'menu:XFER_PAYLOAD':
						f.txt(sender, 'Chuyen den trang xac thuc thong tin chuyen khoan');
						break;	
					case 'menu:PAY_ELECTRIC':
						f.txt(sender, 'Ban muon thanh toan hoa don tien dien');
						
						/*
						const buttonEVNs = 
							[
								{
									content_type:"postback",
									title:"EVN HN",
									payload:"EVN_HNT"
								},
								{
									content_type:"postback",
									title:"EVN HCM",
									payload:"EVN_HN"
								}
							];
						
						const textEVN = 'Ban muon thanh toan hoa don tien dien';
						
						f.btn(sender, {
							textEVN,
							buttonEVNs
						});
						*/
						break;
					case 'menu:PAY_WARTER':
						f.txt(sender, 'Ban muon thanh toan hoa don tien nuoc');
						break;
					case 'menu:PAY_AIR_TICKET':
						f.news(sender, 'Ban muon thanh toan ve ma bay');
						
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
								},
								{
									content_type:"location"
								}
							];
						text = 'Ban tham khao bieu lai suat gui tiet kiem cho cac ky han tai website VietinBank. Ban muon gui tiet kiem ky han nao?';
						
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
						f.txt(sender, 'Ban muon dang ky dich vu Internet Banking cho KHDN');
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
								f.txt(sender, 'Dang kiem tra thong tin tai khoan cua ban...');
								f.txt(sender, 'Tai khoan 1010xxxxx3485 cua ban hien co so du kha dung 23,300,000 VND, trang thai tai khoan Active');
								break;
							case 'chuyenkhoan':
								f.txt(sender, 'Chuyen ban toi trang nhap thong tin chuyen khoan...');
								break;	
							case 'guitietkiem':
								f.txt(sender, 'Chuyen ban toi trang nhap thong tin gui tiet kiem...');
								break;	
							case 'dangkydichvu':
								//f.txt(sender, 'Chuyen ban toi trang nhap thong tin dang ky dich vu...');
								let data = {
										text: 'Bạn muốn đăng ký dịch vụ nào của VietinBank?',
										buttons: [{
												type: 'web_url',
												title: 'FinBot',
												url: 'http://hungpt.handcraft.com/'
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
											f.txt(sender, bye.value + ' ' + first_name + ' ^_^ :) :D :( O:) :P ;) :O -_- >:O :* 8-) (y) ');
										})
										.catch(error => {
											console.log('getProfile err: ' +error);
											f.txt(sender, bye.value  + ' ❤️');
										});
									
								}
								break;
							case 'camon':
								f.txt(sender, 'Khong co chi, neu can them tro giup ban cho minh thong tin nhe');
								break;	
							default:
								console.log(`?  ${intent.value}`);
								f.txt(sender, 'Okey! Ban muon thuc hien '+ intent.value);
								f.txt(sender, 'Du lieu thu thap: '+ JSON.stringify(entities));
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
						f.txt(sender, 'Lai suat tien gui tiet kiem 3 thang o VietinBank hien dang la 4,3%');
						break;
					case 'SAVE_6M':
						f.txt(sender, 'Lai suat tien gui tiet kiem 6 thang o VietinBank hien dang la 5,3%');
						break;
					case 'SAVE_12M':	
						f.txt(sender, 'Lai suat tien gui tiet kiem 12 thang o VietinBank hien dang la 6,8%');
						break;
					default:
						f.txt(sender, 'Du lieu thu thap: '+ JSON.stringify(quickReply));
						break;		
				}
			}
			
			if (message && message.attachments) {
				console.log('message.attachments: ' + JSON.stringify(message.attachments));
				let locTitle = message.attachments[0].title;
				let coord = message.attachments[0].payload.coordinates;
				let locLat = coord.lat;
        let locLong = coord.long;
				f.txt(sender, 'Bạn đang ở gần ' + locTitle + '(lat: ' + locLat + ', long: ' + locLong + '), quanh bạn có các PGD sau của VietinBank: [123 Xã Đàn] [15 Nam Đồng] [19 Tây Sơn]');
			}
		});
		
		return next();
	});

//	agenda.start();
//});

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
							"type": "web_url",
							"title": "Đăng ký dịch vụ",
							"url": "http://vietinbank.vn/"
						},
            {
              "title":"Gửi tiết kiệm",
              "type":"postback",
              "payload":"menu:SAVING_PAYLOAD"
            },
						{
							"type": "web_url",
							"title": "Khởi tạo khoản vay",
							"url": "http://vietinbank.vn/"
						},
						{
							"title":"Thanh toán",
							"type":"nested",
							"call_to_actions":[
									{
										"title":"Tiền điện",
										"type":"postback",
										"payload":"menu:PAY_ELECTRIC"
									},
									{
										"title":"Tiền nước",
										"type":"postback",
										"payload":"menu:PAY_WARTER"
									},
									{
										"title":"Vé máy bay",
										"type":"postback",
										"payload":"menu:PAY_AIR_TICKET"
									},
									{
										"title":"Bảo hiểm",
										"type":"postback",
										"payload":"menu:PAY_ISSURANCE"
									},
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