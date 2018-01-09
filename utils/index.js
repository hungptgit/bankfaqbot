'use strict';
var moment = require('moment');
var https = require('https');
var enc = require('./encoder');

function isvalidateInput(str) {
    var pattern = /^\w+[a-z A-Z_]+?\@[0-9]{1,2}\:[0-9]{1,2}\w[to][0-9]{1,2}:[0-9]{1,2}$/;
    if (str.match(pattern) == null) {
        return false;
    } else {
        return true;
    }
}

function getFormattedTime(tsfrom, tsto) {
    var timeString = moment.unix(tsfrom).format("HH:mm") + ' - ' + moment.unix(tsto).format("HH:mm")
    return timeString;
}

function getFormattedDay(tsfrom) {
    var dateString = moment.unix(tsfrom).format("MMM, DD");
    return dateString;
}

const fetchEntity = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;

    if(!val) {
      return null;
    } else {
      return typeof val === 'object' ? val.value : val;
    }
}

const firstEntity = (entities, name) => {
  return entities &&
    entities[name] &&
    Array.isArray(entities[name]) &&
    entities[name] &&
    entities[name][0];
}

const htmlDecode = (dataEncoded) => {
  return enc.htmlDecode(dataEncoded);
}

function getATMLoc(lat,long){
  var key = 'AIzaSyApV3JtRmRTaLNo-sQOpy8t0regdrri7Sk';
  var location = lat+','+long;
  var radius = 16000;
  var sensor = false;
  var types = "atm";
  var keyword = "vietinbank";

  var https = require('https');
  var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + "key=" + key + "&location=" + location + "&radius=" + radius + "&sensor=" + sensor + "&types=" + types + "&keyword=" + keyword;
  console.log(url);
  
  https.get(url, function(response) {
    var body ='';
    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      var places = JSON.parse(body);
      var locations = places.results;
      //var randLoc = locations[Math.floor(Math.random() * locations.length)];
      
      return locations;
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
    return;
  });
}

module.exports = {
  isvalidateInput,
  getFormattedTime,
  getFormattedDay,
  fetchEntity,
  firstEntity,
  htmlDecode
}
