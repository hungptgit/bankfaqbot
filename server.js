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
// Scenarios
const Scenario = require('./scenarios');
const scen = new Scenario(f);

// Wit.ai
const Wit = require('node-wit').Wit;
const wit = new Wit({
	accessToken: config.WIT_ACCESS_TOKEN
});

//const {firstEntity, fetchEntity} = require('./utils');
var utils = require('./utils');

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
			
			console.log('----> msg : ' + JSON.stringify(msg));
			
			if (postback && postback.payload) {
				scen.processPostback(sender, postback, f);
			}
			else if (message && message.text && !message.quick_reply){
				scen.processMessage(sender, message, f, wit);
			}
			else if (message && message.quick_reply) {
				scen.processQuickreply(sender, message, f);
			}
			else if (message && message.attachments) {
				scen.processAttachment(sender, message, f);
			}
			else {
				
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