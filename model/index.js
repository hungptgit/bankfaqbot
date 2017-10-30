'use strict';
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
var db;

class Model {
  constructor() {
    console.log('Model starting...');
    // Initialize connection once
    MongoClient.connect(config.MONGO_URI, function(err, database) {
      if (err) throw err;

      db = database;
      console.log("Connected to MongoDB...");
    });
  }

  findAll(id) {
    db.collection("replicaset_mongo_client_collection").find({}, function(err, docs) {
      docs.each(function(err, doc) {
        if (doc) {
          console.log(doc);
        }
      });
    });
  }
}

module.exports = Model;