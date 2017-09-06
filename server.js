'use strict';
const config = require('./config');
// create an API server
const Restify = require('restify');
const server = Restify.createServer({
	name: 'VTBBot'
});
const PORT = process.env.PORT || 3000;

// FBeamer
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);

server.use(Restify.jsonp());
server.use(Restify.bodyParser());
server.use((req, res, next) => f.verifySignature(req, res, next));

// WIT.AI
const Wit = require('node-wit').Wit;
const wit = new Wit({
	accessToken: config.WIT_ACCESS_TOKEN
});

// OMDB
//const utils = require('./utils');
const omdb = require('./omdb');


// Register the webhooks
server.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

// Handle incoming
server.post('/', (req, res, next) => {
	f.incoming(req, res, msg => {
		const {
			sender,
			postback,
			message
		} = msg;
		
		console.log('msg : ' + JSON.stringify(msg));
		
		if (message && message.text) {
				// Process the message here
				let messageTxt = message.text;

				console.log('messageTxt:		' + messageTxt);
				//messageTxt = utils.KhongDau(messageTxt);
				//console.log('messageTxt KhongDau:		' + messageTxt);
			
				// Wit's Message API
				wit.message(messageTxt)
					.then(omdb)
					.then(response => {
						f.txt(sender, response.text);
						if(response.image) {
							f.img(sender, response.image);
						}
					})
					.catch(error => {
						console.log(error);
						f.txt(sender, "My servers are acting weird today! Try asking me again after a while.");
					});
						
			}

	});

	return next();
});


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
							"url": "http://vietinbank.vn/"
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

server.listen(PORT, () => console.log(`Bot running on port ${PORT}`));