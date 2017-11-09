'use strict';
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
var db;

//const Question = require('question');
//const question = new Question(db);

class Model {
  constructor() {
    console.log('Model starting...');
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
  
  add(field, content, tag) {
    var collection = db.collection('questions');
    //Create some document
    var questionItem = {
      field: field,
      content: content,
      state: 'MA',
      tag: tag
    };

    // Insert some items
    collection.insert([questionItem], function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "question" collection. The documents inserted with "_id" are:', result.length, result);
      }
    });

  }
}

module.exports = Model;