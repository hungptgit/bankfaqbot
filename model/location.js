'use strict';
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
var db;

class Location {
  constructor() {
    console.log('Location starting...');
    // Initialize connection once
    MongoClient.connect(config.MONGO_URI, function(err, database) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        throw err;
      } else {
        db = database;
        console.log('Connection established to', config.MONGO_URI);
      }
    });
  }
  
  add(address, latitude, longitude, latlng, locationId, locationName, locationType) {
    var collection = db.collection('locations');
    //Create some document
    var locationItem = {
      locationId: locationId,
      locationName: locationName,
      locationType: locationType,
      latitude: latitude,
      longitude: longitude,
      latlng: latlng,
      address: address
    };

    // Insert some items
    collection.insert([locationItem], function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "locations" collection. The documents inserted with "_id" are:', result.length, result);
      }
    });

  }
}

module.exports = Location;