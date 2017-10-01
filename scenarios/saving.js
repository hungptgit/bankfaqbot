'use strict';

class Saving {
  constructor() {
    console.log('Saving starting...');
  }

  showPeriod(sender, f) {
    let buttons = '';
    let text = '';
    let data = '';
    console.log('showPeriod');
    
    try {
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
    } catch (e) {
      console.log(e);
    }
  }

}


module.exports = Saving;