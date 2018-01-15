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
    var radius = 1000;
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

        var displayIndex = 5;
        if (displayIndex > locations.length) {
          displayIndex = locations.length;
        }

        var arrayLocationDisplay = [];

        for (var i = 0; i < displayIndex; i++) {
          var displayLoc = locations[i];
          //console.log('getAtmLocation: ' + i + ' >>> ' + JSON.stringify(displayLoc));
          var targetLoc = displayLoc.geometry.location.lat + ',' + displayLoc.geometry.location.lng;
          var gmapUrl = "https://www.google.com/maps/dir/" + location + "/" + targetLoc;
          var imgUrl = "https://www.maketecheasier.com/assets/uploads/2017/07/google-maps-alternatives-featured.jpg";
          
          arrayLocationDisplay.push({
            title: displayLoc.name,
            image_url: imgUrl,
            subtitle: displayLoc.vicinity,
            default_action: {
              type: "web_url",
              url: gmapUrl,
              //messenger_extensions: true,
              //webview_height_ratio: "tall",
              //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
            },
            buttons: [{
              type: "web_url",
              url: gmapUrl,
              title: "Chỉ dẫn"
            }]
          });

        }

        if (arrayLocationDisplay.length > 0) {
          var obj = {
            recipient: {
              id: sender
            },
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: arrayLocationDisplay
                }
              }
            }
          }

          f.sendNews(obj)
            .catch(error => console.log('getAtmLocation: ' + error));
        } else {
          f.txt(sender, 'Không tìm thấy địa điểm nào phù hợp với yêu cầu của anh/chị');
        }

        return locations;
      });
    }).on('error', function(e) {
      console.log("getAtmLocation Got error: " + e.message);
      return;
    });
  }

  getAtmLocationByText(sender, locationText, f) {
    var key = 'AIzaSyApV3JtRmRTaLNo-sQOpy8t0regdrri7Sk';
    var types = "atm";
    
    var https = require('https');
    var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?" + "key=" + key + "&query=ATM+VietinBank+" + locationText + "&types=" + types + "&language=vi";
    console.log(url);

    https.get(url, function(response) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });

      response.on('end', function() {
        var places = JSON.parse(body);
        var locations = places.results;

        var displayIndex = 5;
        if (displayIndex > locations.length) {
          displayIndex = locations.length;
        }

        var arrayLocationDisplay = [];

        for (var i = 0; i < displayIndex; i++) {
          var displayLoc = locations[i];
          //console.log('getAtmLocation: ' + i + ' >>> ' + JSON.stringify(displayLoc));
          var targetLoc = displayLoc.geometry.location.lat + ',' + displayLoc.geometry.location.lng;
          var gmapUrl = "https://www.google.com/maps?q="+targetLoc+"&hl=es;z=14&amp;output=embed";
          var imgUrl = "https://www.maketecheasier.com/assets/uploads/2017/07/google-maps-alternatives-featured.jpg";
         
          //if (displayLoc.name.toLowerCase.includes('vietinbank')) {
            arrayLocationDisplay.push({
              title: displayLoc.name,
              image_url: imgUrl,
              subtitle: displayLoc.formatted_address,
              default_action: {
                type: "web_url",
                url: gmapUrl,
                //messenger_extensions: true,
                //webview_height_ratio: "tall",
                //fallback_url: "https://peterssendreceiveapp.ngrok.io/"
              },
              buttons: [{
                type: "web_url",
                url: gmapUrl,
                title: "Chỉ dẫn"
              }]
            });
          //}

        }

        if (arrayLocationDisplay.length > 0) {
          var obj = {
            recipient: {
              id: sender
            },
            message: {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: arrayLocationDisplay
                }
              }
            }
          }

          f.sendNews(obj)
            .catch(error => console.log('getAtmLocationByText: ' + error));
        } else {
          f.txt(sender, 'Không tìm thấy địa điểm nào phù hợp với yêu cầu của anh/chị');
        }
        return locations;
      });
    }).on('error', function(e) {
      console.log("getAtmLocationByText Got error: " + e.message);
      return;
    });
  }

}

module.exports = Location;