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
const utils = require('./utils');
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
		
		//console.log(postback.payload);
		
			if (postback && postback.payload) {
				// Process the message here
				let messageTxt = postback.payload;
				console.log('postback.payload :' + messageTxt);
				
				switch(messageTxt) {
					case 'GET_STARTED_PAYLOAD':
						f.txt(sender, 'Xin chao ban! Chuc ban mot ngay tot lanh. Hay lua chon cac tinh nang');
						break;
					case 'menu:INQ_BALANCE_PAYLOAD':
						f.txt(sender, 'Ban muon van tin so du tai khoan: Tien gui? Tien vay ?');
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

				console.log('messageTxt:		' + messageTxt);
				messageTxt = utils.KhongDau(messageTxt);
				console.log('messageTxt KhongDau:		' + messageTxt);
			
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
						f.txt(sender, "Hmm. My servers are acting weird today! Try asking me again after a while.");
					});
						
			}

	});

	return next();
});

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`Bot running on port ${PORT}`));