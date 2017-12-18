'use strict';
const config = require('../config');

var easysoap = require('easysoap');
var clientParams = {
  host: config.SOAP_WSDL_URL,
  path: '/LocationWS',
  wsdl: '/LocationWS?wsdl'
};

var clientOptions = {
  secure: true
};

var soapClient = easysoap.createClient(clientParams, clientOptions);

class Services {
  constructor() {
    console.log('Services starting...');

  }

  location(sender, locLat, locLong, f) {
    console.log('location service call...');
    soapClient.call({
        'method': 'getAllLocation',
        'params': {
          'locationType': null,
          'keyword':null
        }
      })
      .then(function(callResponse) {
        console.log(callResponse);
      })
      .catch(function(err) {
        console.log("Got an error making SOAP call: ", err);
      });

  }
}

module.exports = Services;