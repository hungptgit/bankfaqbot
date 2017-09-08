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
						//f.txt(sender, 'Ban muon thanh toan ve may bay');
						
						const buttonsA = 
							[
								{
									content_type:"text",
									title:"JSP",
									image_url:"http://www.vietinbank.vn/vtbresource/web/export/system/modules/com.vietinbank.cardtemplate/resources/img/logo.png",
									payload:"JSP"
								},
								{
									content_type:"text",
									title:"VNA",
									image_url:"http://www.vietinbank.vn/vtbresource/web/export/system/modules/com.vietinbank.cardtemplate/resources/img/logo.png",
									payload:"VNA"
								},
								{
									content_type:"text",
									title:"VJA",
									image_url:"http://www.vietinbank.vn/vtbresource/web/export/system/modules/com.vietinbank.cardtemplate/resources/img/logo.png",
									payload:"VJ"
								}
							];
						const textA = 'Ban muon thanh toan ve may bay?';
						
						f.quick(sender, {
							textA,
							buttonsA
						});
						
						/*
						const buttonATs = 
							[
								{
									content_type:"text",
									title:"VietJet Air",
									image_url:"http://www.vietinbank.vn/vtbresource/web/export/system/modules/com.vietinbank.cardtemplate/resources/img/logo.png",
									payload:"VIETJET"
								},
								{
									content_type:"text",
									title:"Vietname Airline",
									image_url:"http://www.vietinbank.vn/vtbresource/web/export/system/modules/com.vietinbank.cardtemplate/resources/img/logo.png",
									payload:"VNA"
								},
								{
									content_type:"text",
									title:"Jestar Pacific",
									image_url:"http://www.vietinbank.vn/vtbresource/web/export/system/modules/com.vietinbank.cardtemplate/resources/img/logo.png",
									payload:"JESTAR"
								}
							];
						const textATs = 'Ban muon thanh toan ve may bay';
						
						f.quick(sender, {
							textATs,
							buttonATs
						});
						*/
						break;
					case 'menu:PAY_ISSURANCE':
						f.txt(sender, 'Ban muon thanh toan bao hiem');
						break;	
					case 'menu:SAVING_PAYLOAD':
						
						const buttons = 
							[
								{
									content_type:"text",
									title:"3 tháng",
									image_url:"http://www.vietinbank.vn/vtbresource/web/export/system/modules/com.vietinbank.cardtemplate/resources/img/logo.png",
									payload:"SAVE_3M"
								},
								{
									content_type:"text",
									title:"6 tháng",
									image_url:"http://www.vietinbank.vn/vtbresource/web/export/system/modules/com.vietinbank.cardtemplate/resources/img/logo.png",
									payload:"SAVE_6M"
								},
								{
									content_type:"text",
									title:"12 tháng",
									image_url:"http://www.vietinbank.vn/vtbresource/web/export/system/modules/com.vietinbank.cardtemplate/resources/img/logo.png",
									payload:"SAVE_12M"
								}
							];
						const text = 'Ban tham khao bieu lai suat gui tiet kiem cho cac ky han tai website VietinBank. Ban muon gui tiet kiem ky han nao?';
						
						f.quick(sender, {
							text,
							buttons
						});
						
						//f.txt(sender, 'Ban tham khao bieu lai suat gui tiet kiem cho cac ky han tai website VietinBank. Ban muon gui tiet kiem ky han nao? 1 thang - 2 thang - 3 thang - 6 thang - 9 thang - 12 thang');
						break;
					default:
						f.txt(sender, 'Ban hay lua chon tinh nang can dung. Choice showing');
						break;
				}
			}
			
			if (message && message.text) {
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
								f.txt(sender, 'Chuyen ban toi trang nhap thong tin dang ky dich vu...');
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