'use strict';

class Account {
  constructor() {
    console.log('Account starting...');
  }

  miniStatement(sender, f) {
    f.txt(sender, 'Danh sách 5 giao dịch gần nhất của tài khoản 1010*****312323 TRAN SON TUNG \n 03/05/17 22:01 +5,000,000 CHUYEN LUONG \n 03/05/17 22:01 -5,000,000 TIET KIEM \n 03/05/17 22:01 -3,242,000 CHUYEN VO \n 03/05/17 22:01 -15,034,000 THANH TOAN EVN');
  }

  acctInfo(id, f) {

    let obj = {
      recipient: {
        id: id
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: "DDA: 1010*****312323 TRAN SON TUNG",
                image_url: "https://thebank.vn/uploads/posts/228/thebank.vn-tienichvuottroicuatheatmvietinbankpepartner-1408694398.jpg",
                subtitle: "Trạng thái: Active. \nSố dư khả dụng: 3,123,567 đ \n ",
                buttons: [{
                  type: "postback",
                  title: "Xem 5 GD gần nhất",
                  payload: "menu:MNSTMT_PAYLOAD"
                }, {
                  type: "postback",
                  title: "Chuyển khoản",
                  payload: "menu:XFER_PAYLOAD"
                }, {
                  type: "postback",
                  title: "Thanh toán",
                  payload: "menu:PAY_ELECTRIC"
                }]
              },
              {
                title: "DDA: 1010*****312556 TRAN SON TUNG",
                image_url: "https://thebank.vn/uploads/posts/228/thebank.vn-tienichvuottroicuatheatmvietinbankpepartner-1408694398.jpg",
                subtitle: "Trạng thái: Closed. \nSố dư khả dụng: 0 đ \n ",
                buttons: [{
                  type: "postback",
                  title: "Xem 5 GD gần nhất",
                  payload: "menu:MNSTMT_PAYLOAD"
                }]
              }
            ]
          }
        }
      }
    }

    console.log('--> news data: ' + JSON.stringify(obj));

    f.sendNews(obj)
      .catch(error => console.log('news: ' + error));
  }

}

module.exports = Account;