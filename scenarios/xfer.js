'use strict';

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

}

module.exports = XFer;