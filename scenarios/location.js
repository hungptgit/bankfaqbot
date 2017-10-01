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
      text = 'Bạn muốn tìm các phòng giao dịch ở quanh khu vực nào';

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