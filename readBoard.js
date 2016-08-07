var http = require('http');
var request = require('request');
var key = "64532d61a0717998dd9b66dfb84beb21";
var token = "2fe820b16904c26222b1719cc69f5adb42f0030740ff8f8f35207b1791f589f0";

var MongoClient = require('mongodb').MongoClient
var assert = require('assert');

// data
var mainData = "";
var checkData = "";
var mainName = "??";
var cardCount = 0;
var totalCards = 0;
var totalTodo = 0;
var totalDone = 0;

// initialised to show the structure
var statData = {
    name: "board name",
    logDate: "",
    id: 1,
    totalCards: 0,
    totalDone: 0,
    totalTodo: 0,
    lists: [
        {
        name: "list one",
        id: 11,
        cards: [
          {
            name: "card 1",
            id: 111,
            done: 0,
            todo: 0,
            checklists: [
              {
                name: "check 1",
                id: "1234"
              },
              {
                name: "check 2",
                id: "2345"              }
            ]
          },
          {
            name: "card 2",
            id: 112,
            done: 0,
            todo: 0,
            checklists: []
          }
        ]
      },
    {
        name: "list two",
        id: 12,
        cards: []}
    ]
};

statData.lists = [];

// Connection URL
var db = 'mongodb://localhost:27017/myproject';

// Use connect method to connect to the server
MongoClient.connect(db, function(err, db) {
  assert.equal(null, err);
  console.log("Connected succesfully to server");


// the board code, found from database?
  var boardName = "Election";
  var boardCode = "JThlckd6";
  var boardId = "578f672ecd5cde67aaf0a744";
    


// read the data
    // https://trello.com/b/D4GKrqbv.json  -> all data, while in browser
  var options = "&fields=name&cards=open&card_fields=all";
  //  options = "";
  var url = "https://trello.com/b/" + boardCode + ".json?key=" + key + "&token=" + token + options;
    // with options  2513 bytes -> card names
    // with no option  756 -> top level

//  options = "cards=open&card_fields=all&idChecklists=all&checkItem_fields=name";
  options = "cards=open&card_fields=idChecklists,name&idChecklists=all&checkItem_fields=name";
  url = "https://api.trello.com/1/boards/" + boardId + "/lists?" + options + "&key=" + key + "&token=" + token;
//  url = "https://api.trello.com/1/boards/" + boardId + "/checklists?" + options + "&key=" + key + "&token=" + token;
//  url = "https://api.trello.com/1/boards/" + boardId + "/checklists?" + "&key=" + key + "&token=" + token;
    // with options card_fields=all -> 38094 bytes
  // with options card_fields=name -> 2926 bytes -> lists > names > cards on each list




//    console.log(url);
    request(url, function (error, response, body) {
        console.log("Response code: " + response.statusCode);

        if (error) {
            console.log("Error: " + error);
        }
        if (!error && response.statusCode === 200) {
            // Use body; no need to handle chunks of data *or* redirects!
//            console.log("Length: " + body.length + "\n");
//            console.log(JSON.stringify(JSON.parse(body),null, 2));
            mainData = JSON.parse(body);


// calculate the stats
            if (Array.isArray(mainData)) {
              if (mainData.length > 0) {
                for (var i=0; i<mainData.length; i++) {
                  mainName = mainData[i].name;
                  cardCount = mainData[i].cards.length;
                  totalCards += cardCount;
                  statData.lists.push({
                      name: mainName,
                      id: mainData[i].id,
                      cards: []
                  });
                  if (cardCount > 0) {
                    for (var j=0; j<cardCount; j++) {
                      statData.lists[i].cards.push({
                          name: mainData[i].cards[j].name,
                          id: mainData[i].cards[j].id,
                          done: 0,
                          todo: 0,
                          checklists: []
                      });
    // for each card, add id of checklists
                      if (mainData[i].cards[j].idChecklists.length > 0) {
                        for (var k=0; k<mainData[i].cards[j].idChecklists.length; k++) {
                          statData.lists[i].cards[j].checklists.push({
                            id: mainData[i].cards[j].idChecklists[k]
                          })             
                        }
                      }
                    }
                  }
                console.log(mainName, ", ", cardCount);
              }
            }
          }
// then read another url, to get checklist data
// for each checklist, save items done/todo
          url = "https://api.trello.com/1/boards/" + boardId + "/checklists?" + "&key=" + key + "&token=" + token;

//        console.log(url);
          request(url, function (error, response, body) {
              console.log("2nd response code: " + response.statusCode);

              if (error) {
                  console.log("Error: " + error);
              }
              if (!error && response.statusCode === 200) {
                  // Use body; no need to handle chunks of data *or* redirects!
      //            console.log("Length: " + body.length + "\n");
      //            console.log(JSON.stringify(JSON.parse(body),null, 2));
                  checkData = JSON.parse(body);

// if respoonse has array
                  if (Array.isArray(checkData)) {
// if array > 0 length
                    if (checkData.length > 0) {
// for each object, 
                      for (var i=0; i<checkData.length; i++) {
                        checkItems = checkData[i].checkItems.length;
// this should have items to be in the list, but check anyway
                        if (checkItems > 0) {
                          for (var j=0; j<checkItems; j++) {
                            totalTodo++;
                            if (checkData[i].checkItems[j].state == "complete") totalDone++;

// find card with this checklist id, get list and card indexes
                           cardId = checkData[i].idCard;
                           var bla = findCardById(statData, cardId);
                           if (bla) {
                              bla.todo++;
                              if (checkData[i].checkItems[j].state == "complete") bla.done++;                             
                           } else {
                             console.log("card id not found:", cardId);
                           }

// update todo/done based on state == incomplete/complete


                          }
                        }
                      }
                    }
                  }

              // format the date/time
                  var date = new Date();
                  var day = "0" + date.getDate();
                  day = day.substring(day.length - 2);
                  var monthIndex = date.getMonth();
                  var month = "0" + (monthIndex+1);
                  month = month.substring(month.length - 2);
                  var year = date.getFullYear();
                  var hour = date.getHours();
                  var minute = date.getMinutes();
                  var seconds = date.getSeconds();
                  var fdate = year + '-' + month + '-' + day + '-' + minute; 

                  statData.id = boardId;
                  statData.id = boardCode;

                  statData.name = boardName;
                  statData.logDate = fdate;
                  statData.totalCards = totalCards;
                  statData.totalDone = totalDone;
                  statData.totalTodo = totalTodo;
                  console.log("done/todo: ", totalDone, totalTodo);
                  console.log(fdate, minute);

              //         col.updateOne({a:3}, {$set: {b: 2}}, {

              // write/update the document - {title:mainName, code:boardCode, date: fdate, cards:cardCount}
                  db.collection('counts').updateOne(
                     {code:boardCode, logDate:fdate},
                     {$set: statData},
                     {upsert: true},
                     function(err, r) {
           //           console.log("rc:", r.upsertedCount);
                        assert.equal(null, err);
                 //     assert.equal(1, r.upsertedCount);
                        console.log(r.upsertedCount + " written...")
                        db.close();
                  });
              }
          });
        }
    });
});

function findCardById(root, id) {
    if (root.lists.length > 0) {
        for (var k in root.lists) {
           if (root.lists[k].cards.length > 0) {
               for (c in root.lists[k].cards) {
      //            console.log(root.lists[k].cards[c].id);
                  if (root.lists[k].cards[c].id == id) {
                      return root.lists[k].cards[c];
                  }                   
               }
           }
        }
    }
};
