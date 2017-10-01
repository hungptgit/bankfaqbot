'use strict';
var utils = require('../utils');

class Saving {
  construct(f) {

  }

  showPeriod(sender, f) {
    let buttons = '';
    let text = '';
    let data = '';
    
    buttons = [{
        content_type: "text",
        title: "3 tháng",
        image_url: "http://www.freeiconspng.com/uploads/dollar-sign-icon-png-22.png",
        payload: "SAVE_3M"
      },
      {
        content_type: "text",
        title: "6 tháng",
        image_url: "http://www.freeiconspng.com/uploads/dollar-sign-icon-png-22.png",
        payload: "SAVE_6M"
      },
      {
        content_type: "text",
        title: "12 tháng",
        image_url: "http://www.freeiconspng.com/uploads/dollar-sign-icon-png-22.png",
        payload: "SAVE_12M"
      }
    ];
    text = 'Bạn dự định gửi tiết kiệm kỳ hạn nào?';

    f.quick(sender, {
      text,
      buttons
    });
  }

}


module.exports = Saving;