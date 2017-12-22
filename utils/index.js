'use strict';
var moment = require('moment');
var https = require('https');
var Encoder = require('encoder.js');

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
  return Encoder.htmlDecode(dataEncoded);
}

module.exports = {
  isvalidateInput,
  getFormattedTime,
  getFormattedDay,
  fetchEntity,
  firstEntity
}
