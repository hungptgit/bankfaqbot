'use strict';
const request = require('request');
const createResponse = require('../vtb');
const config = require('../config');
const getInfo = data => {
  console.log('data: ' + JSON.stringify(data));
  let intent = data.entities.intent && data.entities.intent[0].value || 'undefined';
  //let movie = data.entities.movie && data.entities.movie[0].value || null;
  //let releaseYear = data.entities.releaseYear && data.entities.releaseYear[0].value || null;
  return new Promise((resolve, reject) => {
    if(intent) {
      console.log('intent: ' + intent);
      // Fetch data from DB
      resolve(createResponse(intent, data.entities));
    } else {
      reject("Intent not found!");
    }
  });
}


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
      for (let i = 0 in pages) {
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
        
        if (pages[i].extract !== "") {
            myelement.buttons[0].payload = pages[i].extract.substr(0, 1000).trim();
        }
        myTemplate.message.attachment.payload.elements.push(myelement);
      }
      
      options.body = myTemplate;
    }
    catch (err) {
      console.log("error : " + err.message);
      
    }
    request(options, function(error, response, body) {
      if (error) {
        console.log(error.message);
      }
      console.log(body);
    });
  })
}

module.exports = getInfo;
