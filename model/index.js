'use strict';
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
var db;

const Question = require('question');
const question = new Question(db);

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
}

module.exports = Model;