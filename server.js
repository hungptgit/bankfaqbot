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
// Tokens

// Session
//const session = require('./session');
// WIT Actions
//const actions = require('./actions')(session, f, agenda);


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

// Receive all incoming messages
/*
server.post('/', (req, res, next) => {
	//console.log("receive post:" );
	f.incoming(req, res, msg => {
		
		// Process messages
		const {
			message,
			sender
		} = msg;

		if(message.text) {
			// If a text message is received
			// f.txt(sender, `You just said ${message.text}`);

			// Wit's Message API
			wit.message(message.text, {})
				
				.then(response => console.log(response.entities))
				.catch(error => {
					console.log(error);
					f.txt(sender, "Hmm. My servers are acting weird today! Try asking me again after a while.");
				});
		}
		
		
	});
	return next();
});
*/
agenda.on('ready', () => {
	// Handle incoming
	server.post('/', (req, res, next) => {
		f.incoming(req, res, msg => {
			const {
				sender,
				postback,
				message
			} = msg;

			
			if (postback && !postback.payload.includes("menu")) {
				console.log(postback.payload);
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
				//let sessionId = session.init(sender);
				//let {context} = session.get(sessionId);
				let messageTxt = postback ? postback.payload.split(":")[1] : message.text;

				console.log('messageTxt:' + messageTxt);
				// Wit's Message API
				wit.message(messageTxt, {})
					.then(({
						entities
					}) => {
						console.log('WIT resp:' + entities);
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
							case 'truyvantaikhoan':
								f.txt(sender, 'Okey! Tai khoan cua ban co 100000 VND');
								break;
							default:
								console.log(`🤖  ${intent.value}`);
								f.txt(sender, 'Okey! Ban muon thuc hien ${intent.value}');
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
		"title": "Xem so du",
		"payload": "menu:Xem so du hien tai"
	},
	{
		"type": "postback",
		"title": "Chuyen khoan",
		"payload": "menu:Chuyen khoan trong he thong"
	},
	{
		"title": "Dich vu khac",
		"type": "nested",
		"call_to_actions": [{
				"title": "Gui tiet kiem",
				"type": "postback",
				"payload": "HELP_PAYLOAD"
			},
			{
				"title": "Thanh toan hoa don",
				"type": "postback",
				"payload": "CONTACT_INFO_PAYLOAD"
			}
		]
	}, {
		"type": "web_url",
		"title": "Ve Vietinbank",
		"url": "http://vietinbank.vn/"
	}
]);

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`Chi running on port ${PORT}`));