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

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
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
          var text = event.message.text.toLowerCase().trim();
            console.log(text);
            sendMessage(senderId, "Tui là bot đây: " + text);
            /*
            if (text.toLowerCase().substr(0,4) == 'wiki') {
                wikibot(text.replace("wiki ", ""),senderId)
            }
            else {
                sendHelp(senderId);
            }
            */
        }
      }
    }   
  }

  res.status(200).send("OK");
});


// Gửi thông tin tới REST API để trả lời
function sendMessage(senderId, message) {
  var messageData = {
        text: message
    };

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: "EAAGrFnck27kBACA8PStioYfTGTYbJOH9F2phnhtDQNCkimPBliRgr2hjXxvaTAnT2sjsEJFWTlSg6ANYZAmkeEQesW1MvshQZCbqyl1Ve7OWC93cMS3ZC1FLSZCL5ZCGfGPinZCVUGU4UwD99lRznwxDhgX2BAZAcweutmbUIKDQwZDZD"},
        method: 'POST',
        json: {
            recipient: {id: sender},
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

var url = "https://graph.facebook.com/v2.6/me/messages?access_token=EAAGrFnck27kBACA8PStioYfTGTYbJOH9F2phnhtDQNCkimPBliRgr2hjXxvaTAnT2sjsEJFWTlSg6ANYZAmkeEQesW1MvshQZCbqyl1Ve7OWC93cMS3ZC1FLSZCL5ZCGfGPinZCVUGU4UwD99lRznwxDhgX2BAZAcweutmbUIKDQwZDZD" //replace with your page token

function sendHelp(id) {
  var options = {
    uri: url,
    method: 'POST',
    json: {
      "recipient": {
        "id": id
      },
      "message": {
        "text": "Send wiki space 'Your query' to search wikipedia"
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
    if (error) {
      console.log(error);
    }
    try {
      body = JSON.parse(body);
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

function formatmsg(msg){
    msg = msg.substr(0,320);
    if(msg.lastIndexOf(".") == -1) {
        return msg;
    }
    return msg.substr(0,msg.lastIndexOf(".")+1);
}

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});
