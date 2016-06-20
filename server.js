// # SimpleServer
// A simple chat bot server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
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
