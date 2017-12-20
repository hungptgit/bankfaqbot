'use strict';
const contextMap = require('bot-context');

class XFer {
  constructor() {
    console.log('XFer starting...');
   
  }

  showHelp(sender, f) {
    f.txt(sender, 'Bạn hãy gõ Lệnh chuyển tiền theo cú pháp: Chuyen <So tien> toi <So tai khoan> tai <Ma ngan hang> \n VD: chuyen 1000000 toi 462879758937 tai VCB');
  }
  
  showConfirm(sender, f, confirmMsg, confirmUrl) {
    let buttons = '';
    let text = '';
    let data = '';

    try {
      data = {
        text: confirmMsg,
        buttons: [{
            type: 'web_url',
            title: 'Xác thực',
            url: confirmUrl
          },
          {
            type: 'postback',
            title: 'Chuyển khoản lại',
            payload: 'menu:XFER_PAYLOAD'
          }
        ]
      }
      f.btn(sender, data);
    } catch (e) {
      console.log(e);
    }
  }

  startXferContext(sender, message, f) {
     let ctx = contextMap.getOrCreate(sender);
			if (!ctx.isSet()) {
				this.init(sender,f); // initialize the actions. 
			}

			ctx.match(message, function(err, match, contextCb) {
				if (!err) contextCb(sender, match);
			});
  }
  
  init(userId,f) {
    let ctx = contextMap.getOrCreate(userId);
    ctx.set(
      /.*/, // The base matcher to match anything. 
      (match) => this.getPizzaType(userId,f));
  }

  getPizzaType(userId,f) {
    let ctx = contextMap.getOrCreate(userId);
    ctx.set(
      /(chicken|cheese|veggie)/,
      (match) => this.getDeliveryAddress(userId, match, f)
    );
    f.txt(userId, "What kind of pizza do you want ?");
  }

  getDeliveryAddress(userId, pizzaType,f) {
    let address = 'Sai Gon';
    let ctx = contextMap.getOrCreate(userId);

    if (address) {
      ctx.set(/(yes|no)/, (response) => {
        if (response === 'yes') {
          //userDataService.clearAddress(userId);
          this.getDeliveryAddress(userId, pizzaType);
        } else {
          this.end(userId, pizzaType, address);
        }
      });
      f.txt(userId, 'Would you like to change your address ?');
      return;
    }

    ctx.set(
      //validateAddressUsingGoogleAPI, // Can use some async API method 
      /(Sai Gon|Ha Noi)/,
      (address) => this.end(userId, pizzaType, address)
    ); // Note that pizzaType is now a closure variable. 
    f.txt(userId, `Please enter the delivery Address.`);
  }

  end(userId, pizzaType, address, f) {
    f.txt(userId, 'Thank you, a ${pizzaType} pizza, will be' +
      +'delivered to ${address} in 30 mins.');
  }


}

module.exports = XFer;