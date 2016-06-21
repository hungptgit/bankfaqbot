// # SimpleServer
// A simple chat bot server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var cheerio = require('cheerio');
var router = express();

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
var request = require("request");
/*
app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});
*/

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running';
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});

// Đây là đoạn code để tạo Webhook
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'ma_xac_minh_cua_ban') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// Xử lý khi có người nhắn tin cho bot
/*
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        // If user send text
        if (message.message.text) {
          var text = message.message.text;
          console.log(text); // In tin nhắn người dùng
          sendMessage(senderId, "Tui là bot đây: " + text);
        }
      }
    }
  }

  res.status(200).send("OK");
});


// Gửi thông tin tới REST API để trả lời
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: "EAAGrFnck27kBACCjDl3HLMmq46twu0EEWumVGDu5khhVjaG7sI02Yar8egpP2cWezRq7jhcKd0aMabZBJNohlTs4zXZCLT36OrlJ2Uq7uw5f6ksySmHvdQb6N4RbH8XYBJZBil9aaJsxANs1Crf2glEUtmghfgZCKKDxJderFwZDZD",
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}
*/

// Xử lý khi có người nhắn tin cho bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      
        // If user send text
        if (message.message && message.message.text) {
          var text = message.message.text.toLowerCase().trim();
            console.log(text);
            //sendMessage(senderId, "Tui là bot đây: " + text);
            text.indexOf('wiki') > -1
            if (text.indexOf('wiki') > -1) {
                wikibot(text.replace("wiki ", ""),senderId);
            }
            else if (text.indexOf('ipay') > -1 ) {
                ipayMessage(senderId, text);
            }
            else if (text.indexOf('efast') > -1) {
                efastMessage(senderId, text);
            }
            else if (text.indexOf('imdb') > -1) {
                crawlerImdb(text, senderId);
            }
            else {
                sendHelp(senderId);
            }
        }
        else if (message.postback) {
           console.log('Received postback: ', JSON.stringify(message.postback));
          // These are for chosing availibility
          sendMessage(senderId, "Cảm ơn bạn nhiều :)");
          /*
          if (JSON.stringify(message.postback) == '{"payload":"postback"}') {
            sendMessage(senderId, "Cảm ơn bạn nhiều :)");
          }
          */
        }
      
    }   
  }

  res.status(200).send("OK");
});

var url = "https://graph.facebook.com/v2.6/me/messages?access_token=EAAGrFnck27kBACCjDl3HLMmq46twu0EEWumVGDu5khhVjaG7sI02Yar8egpP2cWezRq7jhcKd0aMabZBJNohlTs4zXZCLT36OrlJ2Uq7uw5f6ksySmHvdQb6N4RbH8XYBJZBil9aaJsxANs1Crf2glEUtmghfgZCKKDxJderFwZDZD"; //replace with your page token

// Gửi thông tin tới REST API để trả lời
function sendMessage(senderId, message) {
  var messageData = {
        text: message
    };

    request({
        //url: 'https://graph.facebook.com/v2.6/me/messages',
        //qs: {access_token: "EAAGrFnck27kBAM2nKym5IXmPqvtWKg1cZBcxvqZCZAiMQp7GPZCKsmiwdu92D1MZC1BCOz5qsMZBR9PipdH0VCJlXqvBZC9WIcNdHxn5FjuaNQXWVeuihuZA505HypzedqqZAtIWXQbRijMRIs0ayCaTQIL5ZCoX1zj4cnJez3AVgkVQZDZD"},
        uri: url,
        method: 'POST',
        json: {
            recipient: {id: senderId},
            message: messageData
        }
    }, function (error, response) {

        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }

    });  
 
}

function sendHelp(id) {
  var options = {
    uri: url,
    method: 'POST',
    json: {
      "recipient": {
        "id": id
      },
      "message": {
        "text": "Chúng tôi đã ghi nhận yêu cầu và sẽ phản hồi lại bạn sớm. Chúc bạn một ngày may mắn."
      }
    }
  }
  
  request(options, function(error, response, body) {
    if (error) {
      console.log(error.message);
    }
  });
};


function wikibot(query, userid) {
  var queryUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=extracts&exintro&explaintext&exsentences=5&exlimit=max&gsrsearch=" + query;
  var myTemplate = {
    recipient: {
      id: userid
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: []
        }
      }
    }
  };
  
  var options = {
    url: url,
    method: 'POST',
    body: myTemplate,
    json: true
  }
  
  request(queryUrl, function(error, response, body) {
    console.log('wiki query: ', queryUrl);  
    if (error) {
      console.log(error);
    }
    try {
      body = JSON.parse(body);
      //console.log('wiki response: ', body);  
      var pages = body.query.pages;
      for (var i = 0 in pages) {
        var myelement = {
          title: "",
          subtitle: "",
          buttons: [{
            type: "postback",
            title: "Read more",
            payload: "Nothing here, Please view in browser"
          }, {
            type: "web_url",
            url: "",
            title: "View in browser"
          }]
        };
        
        myelement.title = pages[i].title;
        myelement.subtitle = pages[i].extract.substr(0, 80).trim();
        myelement.buttons[1].url = "https://en.wikipedia.org/?curid=" + pages[i].pageid;
        
        if (pages[i].extract != "") {
            myelement.buttons[0].payload = pages[i].extract.substr(0, 1000).trim();
        }
        myTemplate.message.attachment.payload.elements.push(myelement);
      }
      
      options.body = myTemplate;
    }
    catch (err) {
      console.log("error : " + err.message);
      options = {
        uri: url,
        method: 'POST',
        json: {
          "recipient": {
            "id": userid
          },
          "message": {
            "text": "Something went wrong, please try again."
          }
        }
      }
    }
    request(options, function(error, response, body) {
      if (error) {
        console.log(error.message);
      }
      console.log(body);
    });
  })
};

function crawlerImdb(query, userid) {
  var queryUrl = 'http://www.imdb.com/title/tt1229340/';
  
  
  request(queryUrl, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            var title, release, rating;
            var json = { title : "", release : "", rating : ""};

            // We'll use the unique header class as a starting point.

            $('.header').filter(function(){
                // Let's store the data we filter into a variable so we can easily see what's going on.
                var data = $(this);

               // In examining the DOM we notice that the title rests within the first child element of the header tag. 
               // Utilizing jQuery we can easily navigate and get the text by writing the following code:
                title = data.children().first().text();
                release = data.children().last().children().text();

               // Once we have our title, we'll store it to the our json object.
                json.title = title;
                json.release = release;
            })
            
            // Since the rating is in a different section of the DOM, we'll have to write a new jQuery filter to extract this information.

            $('.star-box-giga-star').filter(function(){
                var data = $(this);

                // The .star-box-giga-star class was exactly where we wanted it to be.
                // To get the rating, we can simply just get the .text(), no need to traverse the DOM any further
                rating = data.text();
                json.rating = rating;
            })
            
            console.log("get imdb:" + JSON.stringify(json, null, 4));
        }
    })

};

// send rich message with kitten
function ipayMessage(recipientId, text) {
    var imageUrl = "http://imgs.vietnamnet.vn/Images/2016/06/09/14/20160609140338-banner-vietinbank-ipay-app.jpg";
    var regUrl = "https://ebanking.vietinbank.vn/register";
    var message = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "iPay",
                    "subtitle": "Dịch vụ VietinBank iPay Mobile",
                    "image_url": imageUrl ,
                    "buttons": [{
                        "type": "web_url",
                        "url": regUrl,
                        "title": "Đăng ký ngay"
                        }, {
                        "type": "postback",
                        "title": "Tôi thích iPay",
                        "payload": "User " + recipientId + " likes iPay Mobile" + imageUrl,
                    }]
                }]
            }
        }
    };

    sendImgMessage(recipientId, message);
};


// send rich message with kitten
function efastMessage(recipientId, text) {
    var imageUrl = "https://www.vietinbank.vn/web/export/sites/default/vn/news/16/06/images/e-fast-mobile-H.jpg";
    var regUrl = "http://www.vietinbank.vn/web/export/sites/default/vn/product/ebank/leftblock/download/VBH2.0/GDK_su_dung_eFAST.pdf";
    var message = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "eFast",
                    "subtitle": "Dịch vụ VietinBank eFast Mobile",
                    "image_url": imageUrl ,
                    "buttons": [{
                        "type": "web_url",
                        "url": regUrl,
                        "title": "Đăng ký ngay"
                        }, {
                        "type": "postback",
                        "title": "Tôi thích eFast",
                        "payload": "User " + recipientId + " likes eFast Mobile" + imageUrl,
                    }]
                }]
            }
        }
    };

    sendImgMessage(recipientId, message);
};

// generic function sending messages
function sendImgMessage(recipientId, message) {
    request({
        uri: url,
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

app.set('port', process.env.PORT || 3002 || 8080);
app.set('ip', process.env.IP || "127.0.0.1");

server.listen(app.get('port'), function () {
  console.log('Express server listening on %d, in %s mode', app.get('port'), app.get('env'));
});

/*
server.listen(app.get('port'), app.get('ip'), function() {
  console.log("v1 Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});
*/
