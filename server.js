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


agenda.on('ready', () => {
	// Handle incoming
	server.post('/', (req, res, next) => {
		f.incoming(req, res, msg => {
			const {
				sender,
				postback,
				message
			} = msg;

			//console.log(postback.payload);
			if (postback) {
				console.log('postback: ' + JSON.stringify(postback.payload));
				f.txt(sender, 'Da nhan duoc Yeu cau: ' + postback.payload);
				
				/*
				const {
					schedule,
					fbid,
					id
				} = JSON.parse(postback.payload);

				agenda.now(schedule, {
					fbid,
					id
				});
				*/
			}
			

			if ((message && message.text) || (postback && postback.payload.includes("menu"))) {
				// Process the message here
				let messageTxt = postback ? postback.payload.split(":")[1] : message.text;

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
							f.txt(sender, 'Yeu cau cua ban da duoc ghi nhan. Thanks');
							return;
						}

						switch (intent.value) {
							case 'appt_make':
								console.log('🤖 > Okay, making an appointment');
								break;
							case 'appt_show':
								console.log('🤖 > Okay, showing appointments');
								break;
							/*
							case 'truyvantaikhoan':
								f.txt(sender, 'Okey! Tai khoan cua ban co 100000 VND');
								break;
							*/	
							default:
								console.log(`🤖  ${intent.value}`);
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

	agenda.start();
});

// Persistent Menu
f.showPersistent([{
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
		"type": "nested",
		"title": "Dịch vụ khác",
		"call_to_actions": [{
				"title": "Thanh toán hoá đơn",
				"type": "postback",
				"payload": "menu:PAYMENT_PAYLOAD"
			},
			{
				"title": "Gửi tiết kiệm",
				"type": "postback",
				"payload": "menu:SAVING_PAYLOAD"
			}
		]
	}, 
	{
		"type": "web_url",
		"title": "Về VietinBank",
		"url": "http://vietinbank.vn/"
	}
]);

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`Chi running on port ${PORT}`));