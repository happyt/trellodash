var express = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// web port
var PORT = process.env.PORT || 8080; 

var server = app.listen(PORT, function () {
console.log("App now running on port", PORT);
});
