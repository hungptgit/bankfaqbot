'use strict';

class Register {
  constructor() {
    console.log('Register starting...');
  }

  showRegister(sender, f) {
    let buttons = '';
    let text = '';
    let data = '';

    try {
      data = {
        text: 'Bạn muốn đăng ký dịch vụ nào của VietinBank?',
        buttons: [{
            type: 'web_url',
            title: 'FinBot',
            url: 'http://hungpt.handcraft.com/index.html?fbid=' + sender
          },
          {
            type: 'web_url',
            title: 'iPay',
            url: 'https://www.vietinbank.vn/web/home/vn/product/dang-ky-truc-tuyen.html'
          },
          {
            type: 'postback',
            title: 'eFAST',
            payload: 'REG_EFAST'
          }
        ]
      }

      f.btn(sender, data);
    } catch (e) {
      console.log(e);
    }
  }

  showRegisterFinbot(sender, f) {
    let buttons = '';
    let text = '';
    let data = '';

    try {
      data = {
        text: 'Nếu chưa đăng ký dịch vụ VietinBank FinBot bạn có thể bắt đầu',
        buttons: [{
          type: 'web_url',
          title: 'Đăng ký FinBot',
          url: 'http://hungpt.handcraft.com/index.html?fbid=' + sender
        }]
      }

      f.btn(sender, data);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Register;