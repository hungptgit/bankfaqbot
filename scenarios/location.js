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

  getAtmLocation(sender, lat, long, f) {
    var key = 'AIzaSyApV3JtRmRTaLNo-sQOpy8t0regdrri7Sk';
    var location = lat + ',' + long;
    var radius = 16000;
    var sensor = false;
    var types = "atm";
    var keyword = "VietinBank";

    var https = require('https');
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + "key=" + key + "&location=" + location + "&radius=" + radius + "&sensor=" + sensor + "&types=" + types + "&keyword=" + keyword;
    console.log(url);

    https.get(url, function(response) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });

      response.on('end', function() {
        var places = JSON.parse(body);
        var locations = places.results;

        var displayIndex = 3;
        if (displayIndex > locations.length) {
          displayIndex = locations.length;
        }


        let obj = {
          recipient: {
            id: sender
          },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "generic",
                elements: [{
                    title: "87 Trần Hưng Đạo",
                    image_url: "https://maps.gstatic.com/mapfiles/place_api/icons/atm-71.png",
                    subtitle: "87 Trần Hưng Đạo",
                    default_action: {
                      type: "web_url",
                      url: "https://www.google.com/maps/dir/21.0320622,105.8398501/21.0277644,105.8341598",
                      //messenger_extensions: true,
                      //webview_height_ratio: "tall",
                      //fallback_url: "https://ebanking.vietinbank.vn/rcas/portal/web/retail/bflogin"
                    },
                    buttons: [{
                      type: "web_url",
                      url: "https://www.google.com/maps/dir/21.0320622,105.8398501/21.0277644,105.8341598",
                      title: "Chỉ dẫn"
                    }]
                  },
                  {
                    title: "ATM Vietinbank - Haphaco - Hiệu Thuốc 8-3",
                    image_url: "https://maps.gstatic.com/mapfiles/place_api/icons/atm-71.png",
                    subtitle: "5, Phố Cửa Nam, Phường Cửa Nam, Quận Hoàn Kiếm, Cửa Nam",
                    default_action: {
                      type: "web_url",
                      url: "https://www.google.com/maps/dir/21.0320622,105.8398501/21.0277644,105.8341598",
                      //messenger_extensions: true,
                      //webview_height_ratio: "tall",
                      //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
                    },
                    buttons: [{
                      type: "web_url",
                      url: "https://www.google.com/maps/dir/21.0320622,105.8398501/21.0277644,105.8341598",
                      title: "Chỉ dẫn"
                    }]
                  }
                ]
              }
            }
          }
        }
        
        f.sendNews(obj)
      .catch(error => console.log('news: ' + error));
        
        for (var i = 0; i < displayIndex; i++) {
          var randLoc = locations[i];
          console.log('getAtmLocation: ' + i + ' >>> ' + JSON.stringify(randLoc));
        }
        return locations;
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
      return;
    });
  }

}

module.exports = Location;