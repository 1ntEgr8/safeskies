var mongoose = require("mongoose");
var Ticket = require("../models/ticket");
mongoose.connect("mongodb://localhost/flight_app");

var userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
      },
    last_name: {
        type: String,
        required: true
      },
     seat: {
        type: String,
        unique: true,
        required: true
     },
     language: String,
    tickets: [Ticket.schema]
});

var User = mongoose.model("User", userSchema);

module.exports = User;