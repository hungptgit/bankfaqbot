'use strict';
// create an API server
const config = require('./config');
const Restify = require('restify');
const contextMap = require('bot-context');
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

			let ctx = contextMap.getOrCreate(sender);
			if (!ctx.isSet()) {
				init(sender); // initialize the actions. 
			}

			ctx.match(message, function(err, match, contextCb) {
				if (!err) contextCb(sender, match);
			});


			if (postback && postback.payload) {
				scen.processPostback(sender, postback, f);
			} else if (message && message.text && !message.quick_reply) {
				scen.processMessage(sender, message, f, wit);
			} else if (message && message.quick_reply) {
				scen.processQuickreply(sender, message, f);
			} else if (message && message.attachments) {
				scen.processAttachment(sender, message, f);
			} else {

			}
		});

		return next();
	});

	agenda.start();
});


function init(userId) {
	let ctx = contextMap.getOrCreate(userId);
	ctx.set(
		/.*/, // The base matcher to match anything. 
		(match) => getPizzaType(userId));
}

function getPizzaType(userId) {
	let ctx = contextMap.getOrCreate(userId);
	ctx.set(
		/(chicken|cheese|veggie)/,
		(match) => getDeliveryAddress(userId, match)
	);
	sendMessage(userId, "What kind of pizza do you want ?");
}

function getDeliveryAddress(userId, pizzaType) {
	let address = 'Sai Gon';
	let ctx = contextMap.getOrCreate(userId);

	if (address) {
		ctx.set(/(yes|no)/, (response) => {
			if (response === 'yes') {
				//userDataService.clearAddress(userId);
				getDeliveryAddress(userId, pizzaType);
			} else {
				end(userId, pizzaType, address);
			}
		});
		sendMessage(userId, 'Would you like to change your address ?');
		return;
	}

	ctx.set(
		//validateAddressUsingGoogleAPI, // Can use some async API method 
		/(Sai Gon|Ha Noi)/,
		(address) => end(userId, pizzaType, address)
	); // Note that pizzaType is now a closure variable. 
	sendMessage(userId, `Please enter the delivery Address.`);
}

function end(userId, pizzaType, address) {
	sendMessage(userId, 'Thank you, a ${pizzaType} pizza, will be' +
		+'delivered to ${address} in 30 mins.');
}

function sendMessage(userId, message) {
	f.txt(userId, message);
}

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