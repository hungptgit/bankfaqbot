// # SimpleServer
// A simple chat bot server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();

var fbbot = require('./fbbot.js').fbbot;
var bot = new fbbot();
bot.createGetStartedBtn('GET_STARTED_BUTTON');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
var request = require("request");

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running';
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running :(, v+ version, server is listening on port ', app.get('port'));
});

// Đây là đoạn code để tạo Webhook
app.get('/webhook', function(req, res) {
  console.log('Into /webhook');
  if (req.query['hub.verify_token'] === 'ma_xac_minh_cua_ban') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// Xử lý khi có người nhắn tin cho bot
app.post('/webhook', function(req, res) {
  
  var entries = req.body.entry;
  
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
        console.log('into /webhook post message: ' + message);
        kipalog(message);
        
        // If user send text
      /*  
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
            else {
                sendHelp(senderId);
            }
        }
        else if (message.postback) {
           console.log('Received postback: ', JSON.stringify(message.postback));
          // These are for chosing availibility
          sendMessage(senderId, "Cảm ơn bạn nhiều :)");
          
        }
        */
    } 
    
  }

  res.status(200).send("OK");
});



//EAAGrFnck27kBAC3pENR4OdGjPfePdIL6GIlpEpPOKL4H0KaJcX5RFbbDJOQxuGEPztSDdrghVjcMLQBUoRrsyarm1Ktp7gykjl5LK96w7As6ixCNh5Co0vU0Af38fzZCP00hU3bGklC2EOFg87hxrMofseZAdZBMZAgfdLZAdvAZDZD
//var url = "https://graph.facebook.com/v2.6/me/messages?access_token=EAAGrFnck27kBACCjDl3HLMmq46twu0EEWumVGDu5khhVjaG7sI02Yar8egpP2cWezRq7jhcKd0aMabZBJNohlTs4zXZCLT36OrlJ2Uq7uw5f6ksySmHvdQb6N4RbH8XYBJZBil9aaJsxANs1Crf2glEUtmghfgZCKKDxJderFwZDZD"; //replace with your page token
var url = "https://graph.facebook.com/v2.6/me/messages?access_token=EAAGrFnck27kBAC3pENR4OdGjPfePdIL6GIlpEpPOKL4H0KaJcX5RFbbDJOQxuGEPztSDdrghVjcMLQBUoRrsyarm1Ktp7gykjl5LK96w7As6ixCNh5Co0vU0Af38fzZCP00hU3bGklC2EOFg87hxrMofseZAdZBMZAgfdLZAdvAZDZD"; //replace with your page token

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


function kipalog(msg) {

  var reqId = msg.sender.id;
  var defaultRes = {
    text: 'Chào mừng bạn đã đến với Demo Bot của mềnh, nhắn tin cho mình một trong các nội dung sau (text, generic, button, quick_reply) để lấy mẫu demo nhé, hoặc là click vào nút bên dưới:',
    quick_replies: [{
      "content_type": "text",
      "title": "Text",
      "payload": "QR_PICK_TEXT"
    }, {
      "content_type": "text",
      "title": "Generic",
      "payload": "QR_PICK_GENERIC"
    }, {
      "content_type": "text",
      "title": "Button",
      "payload": "QR_PICK_BTN"
    }, {
      "content_type": "text",
      "title": "Quick reply",
      "payload": "QR_PICK_QUICKREPLY"
    }]
  }

  var defaultText = {
    text: "Đây là 1 đoạn tin nhắn"
  }
  var defaultGeneric = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "Kipalog",
          image_url: "http://railsgirls.com/images/kipalog.png",
          subtitle: "Hello mọi người",
          buttons: [{
            type: "web_url",
            url: "http://kipalog.com/",
            title: "Kipalog site"
          }, {
            type: "postback",
            title: "Bắt đầu lại",
            payload: "HELP"
          }]
        }]
      }
    }
  }
  var defaultBtn = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Đây chỉ là dòng chữ và button phía dưới",
        buttons: [{
          type: "web_url",
          url: "http://kipalog.com/",
          title: "Kipalog site"
        }, {
          type: "postback",
          title: "Bắt đầu lại",
          payload: "HELP"
        }]
      }
    }
  }
  var defaultQR = {
    text: "Pick a color:",
    quick_replies: [{
      content_type: "text",
      title: "Red",
      payload: "QR_PICK_RED"
    }, {
      content_type: "text",
      title: "Green",
      payload: "QR_PICK_GREEN"
    }]
  }


  if (msg.optin) {

    var ref = msg.optin.ref;
    if (ref) {
      switch (ref) {
        case 'FB_MAIN_WEB_BTN':
          bot.sendMsg(reqId, defaultRes);
          break;
        default:
          bot.sendMsg(reqId, defaultRes);
      }
    }

  } else if (msg.message) {
    var msgText = msg.message.text;
    if (typeof msgText === 'string') msgText = msgText.trim().toLowerCase();
    if (msg.message.hasOwnProperty('is_echo')) return;

    //Xử lý Quick Reply
    if (msg.message.quick_reply) {
      if (msg.message.quick_reply.hasOwnProperty('payload')) {
        var payload = msg.message.quick_reply.payload;
        var reg = /QR_PICK_(.*)/i;

        var regex = null;
        if (regex == reg.exec(payload)) {
          switch (regex[1]) {
            case 'RED':
              sendMsg(reqId, {
                text: "Bạn đã chọn màu đỏ"
              });
              setTimeout(() => {
                bot.sendMsg(reqId, defaultRes)
              }, 700);
              break;
            case 'GREEN':
              sendMsg(reqId, {
                text: "Bạn đã chọn màu xanh lá"
              });
              setTimeout(() => {
                bot.sendMsg(reqId, defaultRes)
              }, 700);
              break;
            case 'TEXT':
              sendMsg(reqId, defaultText);
              break;
            case 'BTN':
              sendMsg(reqId, defaultBtn);
              break;
            case 'GENERIC':
              sendMsg(reqId, defaultGeneric);
              break;
            case 'QUICKREPLY':
              sendMsg(reqId, defaultQR);
              break;
            default:
              setTimeout(() => {
                bot.sendMsg(reqId, defaultRes)
              }, 700);
          }
        }

      }
      return;
    }
    //Xử lý text
    switch (msgText) {
      case 'text':
        sendMsg(reqId, defaultText);
        break;
      case 'generic':
        sendMsg(reqId, defaultGeneric);
        break;
      case 'button':
        sendMsg(reqId, defaultBtn);
        break;
      case 'quick_reply':
        sendMsg(reqId, defaultQR);
        break;
 
      default:
        sendMsg(reqId, defaultRes);
    }

    return;

  } else if (msg.delivery) {

    console.log('deli');

  }
  // Xử lý payload
  else if (msg.postback) {
    var msgPayload = msg.postback.payload;

    switch (msgPayload) {
      case 'GET_STARTED_BUTTON':
        sendMsg(reqId, defaultRes);
        break;
      case 'HELP':
        sendMsg(reqId, defaultRes);
        break;
      default:
        sendMsg(reqId, defaultRes);
    }


  } else if (msg.read) {

    console.log('read');

  } else {
    console.log("Webhook received unknown messagingEvent: ", msg);
  }

}

app.set('port', process.env.PORT || 3002 || 8080);
app.set('ip', process.env.IP || "127.0.0.1");

server.listen(app.get('port'), function () {
  console.log('Express server listening on %d, in %s mode', app.get('port'), app.get('env'));
});

