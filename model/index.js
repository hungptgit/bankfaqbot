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

      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        throw err;
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', config.MONGO_URI);

        db = database;
        console.log("Connected to MongoDB...");
      }
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
  
  add(id) {
    var collection = db.collection('question');
    //Create some document
    var questionItem = {field: 'ipay', content: 'Ipay la gi', state: 'MA', tag: 'ipay,ib,internet banking'};
 
    // Insert some users
    collection.insert([questionItem], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "question" collection. The documents inserted with "_id" are:', result.length, result);
      }
    });
    
  }
}

module.exports = Model;