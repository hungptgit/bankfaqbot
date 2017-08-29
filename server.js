'use strict';
// create an API server
const Restify = require('restify');
const server = Restify.createServer({
	name: 'VanillaMessenger'
});
const PORT = process.env.PORT || 3000;

server.use(Restify.jsonp());
server.use(Restify.bodyParser());
server.use((req, res, next) => f.verifySignature(req, res, next));

// Tokens
const config = require('./config');

// FBeamer
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);

// Wit.ai
const Wit = require('node-wit').Wit;
const wit = new Wit({
	accessToken: config.WIT_ACCESS_TOKEN
});

// Vanilla
const matcher = require('./matcher');
const weather = require('./weather');
const {currentWeather, forecastWeather} = require('./parser');


// Register the webhooks
server.get('/', (req, res, next) => {
	//console.log("receive get:" );
	f.registerHook(req, res);
	return next();
});

// Receive all incoming messages
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
		
		// Process messages
		//f.txt(msg.sender, `Hey, you just said ${msg.message.text}`);
		//f.img(msg.sender, "http://www.stickees.com/files/food/sweet/3543-icecream-cone-sticker.png");
		
		/*
		if(msg.message.text) {
			// If a text message is received
			matcher(msg.message.text, data => {
				switch(data.intent) {
					case 'Hello':
						f.txt(msg.sender, `${data.entities.greeting} to you too!`);
						break;
					case 'CurrentWeather':
						weather(data.entities.city, 'current')
							.then(response => {
								let parseResult = currentWeather(response);
								f.txt(msg.sender, parseResult);
							})
							.catch(error => {
								console.log("There seems to be a problem connecting to the weather service");
								f.txt(msg.sender, "Hmm, something's not right with my servers! Do check back in a while...Sorry :(");
							});
						break;
					case 'WeatherForecast':
						weather(data.entities.city)
							.then(response => {
								let parseResult = forecastWeather(response, data.entities);
								f.txt(msg.sender, parseResult);
							})
							.catch(error => {
								console.log("There seems to be a problem connecting to the weather service");
								f.txt(msg.sender, "Hmm, something's not right with my servers! Do check back in a while...Sorry :(");
							});
						break;
					default: {
						f.txt(msg.sender, "Gosh! I don't know what you mean :(");
					}
				}
			});
		}
		*/
	});
	return next();
});

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`Chi running on port ${PORT}`));