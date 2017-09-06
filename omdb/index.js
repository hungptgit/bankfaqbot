'use strict';
const request = require('request');
const createResponse = require('../utils');
const config = require('../config');
const getInfo = data => {
  let intent = data.entities.intent && data.entities.intent[0].value || 'movieInfo';
  //let movie = data.entities.movie && data.entities.movie[0].value || null;
  //let releaseYear = data.entities.releaseYear && data.entities.releaseYear[0].value || null;
  return new Promise((resolve, reject) => {
    if(intent) {
      // Fetch data from DB
      resolve(createResponse(intent, JSON.parse('')));
    } else {
      reject("Intent not found!");
    }
  });
}

module.exports = getInfo;
