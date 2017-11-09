'use strict';
var db;
class Question {
  constructor(db) {
    console.log('Scenario starting...');
    //model.findAll('1');
    db = db;
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

module.exports = Question;