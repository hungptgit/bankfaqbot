'use strict';

class Location {
  constructor() {
    console.log('Location starting...');
  }

  showLocation(sender, f) {
    let buttons = '';
    let text = '';
    let data = '';
    try {
      buttons = [{
        content_type: "location"
      }];
      text = 'Hãy gửi vị trí bạn muốn tìm các địa điểm giao dịch gần nhất của VietinBank';

      f.quick(sender, {
        text,
        buttons
      });
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = Location;