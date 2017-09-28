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
						buttons = 
							[
								{
									content_type:"text",
									title:"📱 Điện thoại",
									//image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
									payload:"PAY_MOBILE"
								},
								{
									content_type:"text",
									title:"💧 Nước",
									//image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
									payload:"PAY_WT"
								},
								{
									content_type:"text",
									title:"⚡ Điện",
									//image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
									payload:"PAY_ELEC"
								},
								{
									content_type:"text",
									title:"✈ Vé máy bay",
									//image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
									payload:"PAY_AT"
								}
							];
						text = 'Bạn muốn thanh toán cho?';
						
						f.quick(sender, {text, buttons});
						break;	
						
						//f.txt(sender, 'Bạn hãy gõ Lệnh thanh toán theo cú pháp: Thanh toan <So tien> cho <Ma hoa don/Ma khach hang/So ve> dich vu <Ma dich vu> \n VD: TT 1000000 cho EVN3278947 dich vu EVN');
						//break;
					case 'menu:PAY_WARTER':
						f.txt(sender, 'Chuyển tới trang thông tin tỷ giá lãi suất');
						break;
					case 'menu:NEWS_PAYLOAD':
						f.news(sender, 'News Feed service');
						
						break;
					case 'menu:MNSTMT_PAYLOAD':
						f.txt(sender, 'Danh sách 5 giao dịch gần nhất của tài khoản 1010*****312323 TRAN SON TUNG \n 03/05/17 22:01 +5,000,000 CHUYEN LUONG \n 03/05/17 22:01 -5,000,000 TIET KIEM \n 03/05/17 22:01 -3,242,000 CHUYEN VO \n 03/05/17 22:01 -15,034,000 THANH TOAN EVN');
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
						text = 'Bạn muốn tìm các địa điểm giao dịch của VietinBank ở quanh khu vực nào';
						
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
						f.txt(sender, 'Chuyển tới trang đăng ký dịch vụ cho KHDN');
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
							f.txt(sender, 'Xin lỗi chúng tôi chưa hiểu yêu cầu của bạn. Chúng tôi sẽ ghi nhận và trả lời bạn sau.');
							return;
						}

						switch (intent.value) {
							case 'truyvantaikhoan':
								f.acctInfo(sender, 'Ban muon van tin so du tai khoan');
								break;
							case 'chuyenkhoan':
								let bankCode = entities.bankCode ? entities.bankCode[0].value : 'VietinBank';
								let sotien = entities.number ? entities.number[0].value : 'undefined';
								let taikhoanthuhuong = entities.number ? entities.number[1].value : 'undefined';
								console.log(' >>>>>> bankCode: ' + bankCode);
								console.log(' >>>>>> sotien: ' + sotien);
								console.log(' >>>>>> taikhoanthuhuong: ' + taikhoanthuhuong);
								
								if(sotien == 'undefined' || taikhoanthuhuong == 'undefined') {
									f.txt(sender, 'Bạn hãy gõ Lệnh chuyển tiền theo cú pháp: Chuyen <So tien> toi <So tai khoan> tai <Ma ngan hang> \n VD: chuyen 1000000 toi 462879758937 tai VCB');
								}	
								else
								{
									data = {
										text: 'Bạn muốn chuyển ' + sotien +'  tới ' + taikhoanthuhuong + ' tại ' + bankCode + '. Nhấn Xác thực để chuyển bạn đến trang xác thực OTP',
										buttons: [{
												type: 'web_url',
												title: 'Xác thực',
												url: 'http://hungpt.handcraft.com/xfer.html?fbid='+sender+'&amt='+sotien+'&benAc='+taikhoanthuhuong+'&benBank='+bankCode
											},
											{
												type: 'postback',
												title: 'Chuyển khoản lại',
												payload: 'menu:XFER_PAYLOAD'
											}				
										]
									}
									f.btn(sender, data);
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
								//let newsType = firstEntity(entities, 'newsType');
								let newsType = entities.newsType ? entities.newsType[0].value : 'undefined';
								
								switch (true) {
									case (newsType.value == 'san pham dich vu' || newsType.value == 'san pham' || newsType.value == 'dich vu'):	
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
								let kyhan = entities.number ? entities.number[0].value : 'undefined';
								let sotientietkiem = entities.number ? entities.number[1].value : 'undefined';
								if(kyhan =='undefined' || sotientietkiem =='undefined') {
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
								}
								else {
									data = {
										text: 'Bạn muốn gửi ' + sotientietkiem +'  kỳ hạn ' + kyhan + ' tháng. Nhấn Xác thực để chuyển bạn đến trang xác thực OTP',
										buttons: [{
												type: 'web_url',
												title: 'Xác thực',
												url: 'http://hungpt.handcraft.com/saving.html?fbid='+sender+'&amt='+sotientietkiem+'&period='+kyhan
											},
											{
												type: 'postback',
												title: 'Gửi TK lại',
												payload: 'menu:SAVING_PAYLOAD'
											}				
										]
									}
									f.btn(sender, data);
								}
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
								let who = firstEntity(entities, 'who');
								let greetings = firstEntity(entities, 'greetings');
								let bye = firstEntity(entities, 'bye');

								if(greetings) {
									f.getProfile(sender)
										.then(profile => {
											const {first_name, timezone} = profile;
											console.log('getProfile: ' + first_name);
											f.txt(sender, greetings.value + ' ' + first_name + '. Tôi có thể giúp gì được cho bạn?');
										})
										.catch(error => {
											console.log('getProfile err: ' +error);
											f.txt(sender, greetings.value  + '. Tôi có thể giúp gì được cho bạn?');
										});
									
								}
								
								if(bye) {
									f.getProfile(sender)
										.then(profile => {
											const {first_name, timezone} = profile;
											f.txt(sender, bye.value + ' ' + first_name + ' :) :D :( O:) :P ;) :O -_- >:O :* 8-) (y) ');
										})
										.catch(error => {
											console.log('getProfile err: ' +error);
											f.txt(sender, bye.value  + ' ❤️');
										});
									
								}
								
								if(who) {
									f.getProfile(sender)
										.then(profile => {
											const {first_name, timezone} = profile;
											f.txt(sender, 'Mình là Chi, rất vui được phục vụ ' + ' ' + first_name + ' ❤️ ');
											f.img(sender,"https://scontent.fhan2-3.fna.fbcdn.net/v/t1.0-9/21764779_302680266875874_1375365853791689812_n.jpg?oh=20ba2f800f62397aab2b330a49be0600&oe=5A4A3F0C");
										})
										.catch(error => {
											console.log('getProfile err: ' +error);
											f.txt(sender, 'Mình là Chi, rất vui được phục vụ bạn ❤️');
										});
									
								}
								break;
							case 'camthan':
								let emoTerm = entities.emoTerm ? entities.emoTerm[0].metadata : 'undefined';
								
								if(emoTerm == 'undefined') {
									f.txt(sender, 'Cảm ơn bạn đã sử dụng dịch vụ của VietinBank ^_^ ');
								}else {
									switch(emoTerm) {
										case 'xinh':
											f.txt(sender, 'Thật vậy ạ, hihi. Cảm ơn ạ 😝');
											break;
										
										case 'thongminh':
											f.txt(sender, 'Bạn quá khen rùi 😊 ');
											break;	
										case 'gioioi':
											f.txt(sender, 'Xin lỗi vì đã làm bạn không vui 🤗');
											break;
										case 'toite':
											f.txt(sender, '😔');
											break;			
										default:
											f.txt(sender, ' ^_^ ');
											break;		
									}
										
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
					case 'PAY_MOBILE':
						f.txt(sender, 'Hiện đang có chương trình KM nạp thẻ Viettel giảm 3%.\nBạn hãy gõ Lệnh Topup Mobileg theo cú pháp: TOPUP <So tien> <So dien thoai> \n VD: topup 1000000 09878788788');
						break;
					case 'PAY_WT':
						f.txt(sender, 'Bạn có thể thanh toán nước cho các nhà cung cấp Nước A, Nước B.\nBạn hãy gõ Lệnh Thanh toán Nước theo cú pháp: PW <So tien> <So HD> <Ma NCC> \n VD: PW 1500000 HD3784384 NCC1');
						break;
					case 'PAY_AT':	
						f.txt(sender, 'Bạn có thể thanh toán vé máy bay cho VietJET, VietnamAirline, Jestar.\nBạn hãy gõ Lệnh Thanh toán Vé máy bay theo cú pháp: PA <So tien> <So Vé> <Ma NCC> \n VD: PA 1500000 HD3784384 NCC1');
						break;
					case 'PAY_ELEC':	
						f.txt(sender, 'Bạn có thể thanh toán tiền điện cho các nhà cung cấp A, B.\nBạn hãy gõ Lệnh Thanh toán Điện theo cú pháp: PE <So tien> <So HD> <Ma NCC> \n VD: PE 1500000 HD3784384 NCC1');
						break;	
					case 'SAVE_3M':
						f.txt(sender, 'Lãi suất gửi tiết kiệm 3 tháng tại VietinBank hiện đang là 4,3%.\nBạn hãy gõ Lệnh Gửi tiết kiệm 3 tháng theo cú pháp: GTK3 <So tien> \n VD: gtk3 1000000');
						break;
					case 'SAVE_6M':
						f.txt(sender, 'Lãi suất gửi tiết kiệm 6 tháng tại VietinBank hiện đang là 5,3%.\nBạn hãy gõ Lệnh Gửi tiết kiệm 6 tháng theo cú pháp: GTK6 <So tien> \n VD: gtk6 1500000');
						break;
					case 'SAVE_12M':	
						f.txt(sender, 'Lãi suất gửi tiết kiệm 12 tháng tại VietinBank hiện đang là 6,8%.\nBạn hãy gõ Lệnh Gửi tiết kiệm 12 tháng theo cú pháp: GTK12 <So tien> \n VD: gtk12 1000000');
						break;
					case 'NEWS_16h30':
						f.txt(sender, 'Bạn đã đăng ký nhận tin thành công. Tin tức mới nhất sẽ được gửi đến bạn lúc 16h30 hàng ngày.');
						break;	
					case 'NEWS_11h':
						f.txt(sender, 'Bạn đã đăng ký nhận tin thành công. Tin tức mới nhất sẽ được gửi đến bạn lúc 11h hàng ngày.');
						break;	
					case 'NEWS_8h30':
						/*
						agenda.now('createReminder', {
							sender,
							datetime: context.datetime,
							task: context.task
						});
						*/
						f.txt(sender, 'Bạn đã đăng ký nhận tin thành công. Tin tức mới nhất sẽ được gửi đến bạn lúc 8h30 hàng ngày.');
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
				f.txt(sender, 'Bạn đang ở gần địa điểm ' + locTitle + '(lat: ' + locLat + ', long: ' + locLong + '), quanh bạn có các PGD sau của VietinBank: \n 🏦 123 Xã Đàn \n 🏦 15 Nam Đồng \n 🏦 19 Tây Sơn');
			}
		});
		
		return next();
	});

	agenda.start();
});

// Persistent Menu
/*
f.showPersistent(
	{"persistent_menu":
	[{
	"locale":"default",
  "composer_input_disabled":false,
  "call_to_actions":[
			{
				"type": "postback",
				"title": "Tài khoản",
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
*/
// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`VietinBanker running on port ${PORT}`));