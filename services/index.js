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

const Location = require('../model/location.js');
const locationModel = new Location();

class Services {
  constructor() {
    console.log('Services starting...');

  }

  location(sender, locLat, locLong, locType, f) {
    console.log('location service call, get locationType : ' + locType);
    soapClient.call({
        'method': 'getAllLocation',
        'params': {
          'locationType': locType,
          'keyword': null
        }
      })
      .then(function(callResponse) {
        //console.log(JSON.stringify(callResponse.data)); // response data as json
        //console.log(callResponse.body); // response body
        //console.log(callResponse.header); //response header
        //console.log(callResponse);
        for(var returnData in callResponse.data){
            console.log(returnData + ": "+ callResponse.data['return']);
          /*  
          locationModel.add(address, latitude, longitude, latlng, locationId, locationName, locationType);
          */
        }
        
      
      })
      .catch(function(err) {
        console.log("Got an error making SOAP call: ", err);
      });

  }
  
  depInterest(sender,f) {
    console.log('depInterest service call, get interests ...');
    soapClient.call({
        'method': 'getDepInterests',
        'params': {
        }
      })
      .then(function(callResponse) {
        console.log(JSON.stringify(callResponse.data)); // response data as json
        //console.log(callResponse.body); // response body
        //console.log(callResponse.header); //response header
        //console.log(callResponse);
      })
      .catch(function(err) {
        console.log("Got an error making SOAP call: ", err);
      });

  }
}

module.exports = Services;