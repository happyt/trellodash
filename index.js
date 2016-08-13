var MongoClient = require('mongodb').MongoClient, 
        assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/myproject';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected succesfully to server");
  // Insert a single document
//   db.collection('inserts').insertOne({a:1}, function(err, r) {
//     assert.equal(null, err);
//     assert.equal(1, r.insertedCount);

//     // Insert multiple documents
//     db.collection('inserts').insertMany([{a:2}, {a:3}], function(err, r) {
//       assert.equal(null, err);
//       assert.equal(2, r.insertedCount);

//       db.close();
//     });
//   });
  
   // Insert a single document
//   db.collection('inserts').insertOne({
//         a:1
//       , b: function() { return 'hello'; }
//     }, {
//         w: 'majority'
//       , wtimeout: 10000
//       , serializeFunctions: true
//     }, function(err, r) {
//     assert.equal(null, err);
//     assert.equal(1, r.insertedCount);
//     db.close();
//   });

//   var col = db.collection('updates');
//   // Insert documents
//   col.insertMany([{a:1}, {a:2}, {a:2}], function(err, r) {
//     assert.equal(null, err);
//     assert.equal(3, r.insertedCount);

//     // Update a single document
//     col.updateOne({a:1}, {$set: {b: 1}}, function(err, r) {
//       assert.equal(null, err);
//       assert.equal(1, r.matchedCount);
//       assert.equal(1, r.modifiedCount);

//     //   // Update multiple documents
//       col.updateMany({a:2}, {$set: {b: 1}}, function(err, r) {
//         assert.equal(null, err);
//         assert.equal(2, r.matchedCount);
//         assert.equal(2, r.modifiedCount);

//     //     // Upsert a single document
//         col.updateOne({a:3}, {$set: {b: 2}}, {
//           upsert: true
//         }, function(err, r) {
//           assert.equal(null, err);
//           assert.equal(1, r.matchedCount);
//           assert.equal(1, r.upsertedCount);
//           db.close();
//         });
//       });
//     });
//   });

 var col = db.collection('findAndModify');
  // Insert a single document
  col.insert([{a:2, b:1}, {a:2, b:3}, {a:2, b:5}], function(err, r) {
    assert.equal(null, err);
    assert.equal(3, r.result.n);

    // Remove a document from MongoDB and return it
    col.findOneAndDelete({a:1}, {
        sort: {a:1}
      }, function(err, r) {
        assert.equal(null, err);
        assert.ok(r.value.b === null);
        db.close();
    });
  });
});
