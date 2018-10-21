// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate');
var User = require("../models/user");
var Ticket = require("../models/ticket");
var Chat = require("../models/chat");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/flight_app");

// Instantiates a client
const translate = new Translate({
  keyFilename: './public/assets/js/GCP/gcp.json'
});

 module.exports = translate;