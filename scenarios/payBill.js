'use strict';

class PayBill {
  constructor() {
    console.log('PayBill starting...');
  }

  showPayType(sender, f) {
    let buttons = '';
    let text = '';
    let data = '';
    
    try {
      buttons = [{
          content_type: "text",
          title: "📱 Điện thoại",
          //image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
          payload: "PAY_MOBILE"
        },
        {
          content_type: "text",
          title: "💧 Nước",
          //image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
          payload: "PAY_WT"
        },
        {
          content_type: "text",
          title: "⚡ Điện",
          //image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
          payload: "PAY_ELEC"
        },
        {
          content_type: "text",
          title: "✈ Vé máy bay",
          //image_url:"http://www.freeiconspng.com/uploads/alarm-icon-29.png",
          payload: "PAY_AT"
        }
      ];
      text = 'Bạn muốn thanh toán cho?';

      f.quick(sender, {
        text,
        buttons
      });
    } catch (e) {
      console.log(e);
    }
  }

}

module.exports = PayBill;