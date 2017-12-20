'use strict';
const request = require('request');
const crypto = require('crypto');

class FBeamer {
	constructor(config) {
		try {
			if (!config || config.PAGE_ACCESS_TOKEN === undefined || config.VERIFY_TOKEN === undefined || config.APP_SECRET === undefined) {
				throw new Error("Unable to access tokens!");
			} else {
				this.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;
				this.VERIFY_TOKEN = config.VERIFY_TOKEN;
				this.APP_SECRET = config.APP_SECRET;
			}
		} catch (e) {
			console.log(e);
		}
	}

	registerHook(req, res) {
		// If req.query.hub.mode is 'subscribe'
		// and if req.query.hub.verify_token is the same as this.VERIFY_TOKEN
		// then send back an HTTP status 200 and req.query.hub.challenge
		let {
			mode,
			verify_token,
			challenge
		} = req.query.hub;

		if (mode === 'subscribe' && verify_token === this.VERIFY_TOKEN) {
			return res.end(challenge);
		} else {
			console.log("Could not register webhook!");
			return res.status(403).end();
		}
	}

	verifySignature(req, res, next) {
		if (req.method === 'POST') {
			let signature = req.headers['x-hub-signature'];
			try {
				if (!signature) {
					throw new Error("Signature missing!");
				} else {
					let hmac = crypto.createHmac('sha1', this.APP_SECRET);
					let ourSignature = `sha1=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;

					//console.log(' >>>>> ourSignature: ' + ourSignature);
					//console.log(' >>>>> signature: ' + signature);

					let bufferA = Buffer.from(ourSignature, 'utf8');
					//let bufferB = Buffer.from(signature, 'utf8');

					//let hash = crypto.createHmac('sha1', this.APP_SECRET).update(JSON.stringify(req.body)).digest('hex');
					try {
						//if(hash !== signature.split("=")[1]) {
						/*if(!bufferA.equals(bufferB)) {
							console.log(' >>>>> bufferA: ' + bufferA);
							console.log(' >>>>> bufferB: ' + bufferB);
							throw new Error("Invalid Signature");
						}
						else {
							//console.log(' >>>>> Valid Signature <<<<< ');
						}
						*/
						let bufferB = Buffer.from(signature, 'utf8');
					} catch (e) {
						console.log('verifySignature: ' + e);
						res.send(500, e);
					}
				}
			} catch (e) {
				console.log('verifySignature 1: ' + e);
				res.send(500, e);
			}
		}

		return next();

	}

	subscribe() {
		request({
			uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST'
		}, (error, response, body) => {
			if (!error && JSON.parse(body).success) {
				console.log("Subscribed to the page!");
			} else {
				console.log('subscribe: ' + error);
			}
		});
	}

	getProfile(id) {
		return new Promise((resolve, reject) => {
			request({
				uri: `https://graph.facebook.com/v2.7/${id}`,
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'GET'
			}, (error, response, body) => {
				if (!error && response.statusCode === 200) {
					resolve(JSON.parse(body));
				} else {
					reject(error);
				}
			});
		});
	}

	getSenderName(id) {
		this.getProfile(id)
			.then(profile => {
				const {
					first_name,
					last_name,
					profile_pic,
					gender,
					id,
					timezone
				} = profile;
			  
			  console.log('getSenderName: ' + JSON.stringify(profile));
			  console.log('first_name: ' + first_name);
				return first_name;
			})
			.catch(error => {
				return '';
			});
	}

	incoming(req, res, cb) {

		// Extract the body of the POST request
		let data = req.body;
		//console.log('>>>>> req: ' + req);
		//console.log('>>>>> incoming: ' + JSON.stringify(data));

		if (data.object === 'page') {
			// Iterate through the page entry Array
			data.entry.forEach(pageObj => {
				// Iterate through the messaging Array
				pageObj.messaging.forEach(msgEvent => {
					let messageObj = {
						sender: msgEvent.sender.id,
						timeOfMessage: msgEvent.timestamp,
						message: msgEvent.message || undefined,
						postback: msgEvent.postback || undefined
					}

					cb(messageObj);
				});
			});
		}
		res.send(200);
	}

	sendMessage(payload) {
		return new Promise((resolve, reject) => {
			// Create an HTTP POST request
			request({
				uri: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'POST',
				json: payload
			}, (error, response, body) => {
				if (!error && response.statusCode === 200) {
					resolve({
						messageId: body.message_id
					});
				} else {
					console.log('>>>>>>>>>> sendMessage err: ' + error);
					reject(error);
				}
			});
		});
	}

	sendNews(payload) {
		return new Promise((resolve, reject) => {
			// Create an HTTP POST request
			request({
				uri: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'POST',
				json: true,
				body: payload
			}, (error, response, body) => {
				if (!error && response.statusCode === 200) {
					resolve({
						messageId: body.message_id
					});
				} else {
					console.log('>>>>>>>>>> sendNews err: ' + error);
					reject(error);
				}
			});
		});
	}

	// Show Persistent Menu
	showPersistent(payload) {
		/*
		let obj = {
			setting_type: "call_to_actions",
			thread_state: "existing_thread",
			call_to_actions: payload
		}
		*/
		console.log('showPersistent: ' + JSON.stringify(payload));

		request({
			uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST',
			json: payload
		}, (error, response) => {
			if (!error && response.statusCode === 200) {
				console.log('showPersistent result:' + JSON.stringify(response.body));
			} else {
				console.log('showPersistent error:' + JSON.stringify(response.body));
			}
		});
	}

	// Send a text message
	txt(id, text) {
		let obj = {
			recipient: {
				id
			},
			message: {
				text
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log('txt: ' + error));
	}

	// Send an image message
	img(id, url) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'image',
					payload: {
						url
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log('img: ' + error));
	}

	// A button
	btn(id, data) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'button',
						text: data.text,
						buttons: data.buttons
					}
				}
			}
		}
		console.log('btn obj: ' + JSON.stringify(obj));

		this.sendMessage(obj)
			.catch(error => console.log('btn: ' + error));
	}

	// Quick Replies
	quick(id, data) {
		console.log('quick obj: ' + JSON.stringify(data));

		let obj = {
			recipient: {
				id
			},
			message: {
				text: data.text,
				quick_replies: data.buttons
			}
		}

		console.log('quick obj: ' + JSON.stringify(obj));

		this.sendMessage(obj)
			.catch(error => console.log('quick: ' + error));
	}

}

module.exports = FBeamer;