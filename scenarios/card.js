'use strict';

class Card {
  constructor() {
    console.log('Card starting...');
  }
  
   showQAEpartner(sender, f) {
    let buttons = '';
    let text = '';
    let data = '';

    try {
      data = {
        text: 'Các câu hỏi thường gặp về thẻ ATM Epartner của VietinBank mà bạn có thể muốn tìm hiểu thêm',
        buttons: [
          {
            type: 'postback',
            title: 'Quy trình mở mới',
            payload: 'QA_CARD_EPARTNER_ISSUE'
          },
          {
            type: 'postback',
            title: 'Phí phát hành',
            payload: 'QA_CARD_EPARTNER_ISSUE_FEE'
          },
          {
            type: 'postback',
            title: 'Các tiện ích Thẻ',
            payload: 'QA_CARD_EPARTNER_UTILITY'
          }
        ]
      }

      f.btn(sender, data);
    } catch (e) {
      console.log(e);
    }
  }
  
  showQACreditCard(sender, f) {
    let buttons = '';
    let text = '';
    let data = '';

    try {
      data = {
        text: 'Các câu hỏi thường gặp về thẻ TDQT của VietinBank mà bạn có thể muốn tìm hiểu thêm',
        buttons: [
          {
            type: 'postback',
            title: 'Quy trình mở mới',
            payload: 'QA_CARD_CREDIT_ISSUE'
          },
          {
            type: 'postback',
            title: 'Phí phát hành',
            payload: 'QA_CARD_CREDIT_ISSUE_FEE'
          },
          {
            type: 'postback',
            title: 'Các tiện ích Thẻ',
            payload: 'QA_CARD_CREDIT_UTILITY'
          }
        ]
      }

      f.btn(sender, data);
    } catch (e) {
      console.log(e);
    }
  }
}


module.exports = Card;