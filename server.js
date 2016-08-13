var stats = require("./stats");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var ENTRIES_COLLECTION = "entries";
var STATS_COLLECTION = "counts";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// web port
var PORT = process.env.PORT || 8080; 
// Connection URL
var DBLINK = process.env.MONGODB_URI || 'mongodb://localhost:27017/myproject';

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(DBLINK, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(PORT, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// ENTRIES API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/entries"
 *    GET: finds all entries
 *    POST: creates a new contact
 */

app.get("/entries", function(req, res) {
  db.collection(ENTRIES_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get entries.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/entries", function(req, res) {
  var newEntry = req.body;
  console.log("body:", req.body);
  newEntry.createDate = new Date();

  if (!req.body.boardName || !req.body.boardCode) {
    handleError(res, "Invalid input, Must provide a board name AND boardCode.", 400);
  }
  else {

// find trello board id here?
    url = "https://trello.com/b" + req.body.boardCode + ".json";
  

    db.collection(ENTRIES_COLLECTION).insertOne(newEntry, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new entry.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});

/*  "/entries/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/entries/:id", function(req, res) {
  db.collection(ENTRIES_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get entry");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/entries/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(ENTRIES_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update entry");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/entries/:id", function(req, res) {
  db.collection(ENTRIES_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete entry");
    } else {
      res.status(204).end();
    }
  });
});


// aggregate the db logged values to a more simple format
app.get("/counts/:board", function(req, res) {
  db.collection(STATS_COLLECTION).aggregate(
    {$match:{name:req.params.board}},
    {$unwind:"$lists"},
    {$unwind:"$lists.cards"},
    {$group: {
       _id :{logDate : "$logDate", listname :"$lists.name" }, 
       boardName: {$first: "$name"},     
       totalCards : {$first :"$totalCards"},
       totalTodo: {$first :"$totalTodo"},
       totalDone : {$first :"$totalDone"},
       plainCards : {$first :{ $ifNull: [ "$plainCards", {$literal : 2} ] }},
       cards :{$sum : 1},
       todo:{ $sum :"$lists.cards.todo" },
       done :{$sum : "$lists.cards.done"}
      }
    },
    {$project: {
       _id : "$_id.logDate",
       boardName : "$boardName",
       listName : "$_id.listname",
       totalCards : "$totalCards",
       totalTodo: "$totalTodo",
       totalDone : "$totalDone",
       plainCards : "$plainCards",
       target :{ $add: ["$totalTodo" , { $multiply : [{$literal: 10 }, "$plainCards" ] }]},
       cards : "$cards",
       todo: "$todo",
       done : "$done"
      }
    },
    {$group : {
       _id: "$_id",
       boardName: {$first: "$boardName"},
       totalCards : {$first :"$totalCards"},
       totalTodo: {$first :"$totalTodo"},
       totalDone : {$first :"$totalDone"},
       plainCards : {$first :"$plainCards"},
       target : {$first :"$target"},
       listOut : { 
         $push :  {
            list : "$listName",
            todo : "$todo",
            done : "$done",
            cards : "$cards"
          }
        }
      }
    },
    {$sort:{_id:1}}
    ).toArray( function(err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get counts");
      } else {
        res.status(200).json(docs);
      }
    });
});

// previous version - perhaps
app.get("/counts1/:board", function(req, res) {
  db.collection(STATS_COLLECTION).aggregate(
    {$match:{name:req.params.board}},
    {$unwind:"$lists"},
    {$unwind:"$lists.cards"},
    {$group: {
        _id:{logDate: "$logDate", listname:"$lists.name"},
        cards:{$sum:1},
        plain:{plain:1},
        todo:{$sum:"$lists.cards.todo"},
        done:{$sum:"$lists.cards.done"}
      }
    },
    {$sort:{_id:1}}
    ).toArray( function(err, docs) {
      if (err) {
        handleError(res, err.message, "Failed to get counts");
      } else {
        res.status(200).json(docs);
      }
    });
});

app.get("/trigger", function(req, res) {
  console.log("TRIGGERED...");
  db.collection(ENTRIES_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      consoole.log("Failed to get entries");
      handleError(res, err.message, "Failed to get entries.");
    } else {
      console.log("NEXT...");
      if (docs.length > 0) {
        for (var i=0; i<docs.length; i++) {
          if (docs[i].enabled) {
            stats.update(docs[i].boardName, docs[i].boardCode, docs[i].boardId, docs[i].hourly );
            console.log("Enabled...", docs[i].boardName);
          }
        }
      }
      res.status(200).json({"reply": "OK"});
    }
  });
});

