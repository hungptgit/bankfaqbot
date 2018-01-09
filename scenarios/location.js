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
        if(displayIndex > locations.length) {
          displayIndex = locations.length;
        }
        
        for (var i=0; i<displayIndex; i++) {
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