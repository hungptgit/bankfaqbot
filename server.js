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
const intents = require('./intents');

const {
	firstEntity,
} = require('./utils');


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
			const {
				sender,
				postback,
				message
			} = msg;

			//console.log(postback.payload);
			if (msg.postback && postback.payload) {
				// Process the message here
				let messageTxt = postback.payload;
				console.log('postback.payload :' + messageTxt);
				
				switch(messageTxt) {
					case 'GET_STARTED_PAYLOAD':
						f.txt(sender, 'Xin chao ban! Chuc ban mot ngay tot lanh. Hay lua chon cac tinh nang');
						break;
					case 'menu:INQ_BALANCE_PAYLOAD':
						//f.txt(sender, 'Ban muon van tin so du tai khoan: Tien gui? Tien vay ?');
						vtb(messageTxt, 'current')
							.then(response => {
								f.txt(sender, response);
							})
							.catch(error => {
								console.log("There seems to be a problem connecting to the acct inq service");
								f.txt(msg.sender, "Hmm, something's not right with my servers! Do check back in a while...Sorry :(");
							});
						break;	
					case 'menu:XFER_PAYLOAD':
						f.txt(sender, 'Ban muon chuyen khoan trong hay ngoai he thong');
						break;
					case 'menu:PAYMENT_PAYLOAD':
						f.txt(sender, 'Ban muon thanh toan cho');
						break;
					case 'menu:SAVING_PAYLOAD':
						f.txt(sender, 'Ban tham khao bieu lai suat gui tiet kiem cho cac ky han tai website VietinBank. Ban muon gui tiet kiem ky han nao? 1 thang - 2 thang - 3 thang - 6 thang - 9 thang - 12 thang');
						break;
					default:
						f.txt(sender, 'Ban hay lua chon tinh nang can dung');
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
						const intent = firstEntity(entities, 'intent');
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
  "composer_input_disabled":true,
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
              "title":"Thanh toán",
              "type":"postback",
              "payload":"menu:PAYMENT_PAYLOAD"
            },
            {
              "title":"Gửi tiết kiệm",
              "type":"postback",
              "payload":"menu:SAVING_PAYLOAD"
            },
						{
							"type": "web_url",
							"title": "Đăng ký dịch vụ",
							"payload": "http://vietinbank.vn/"
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