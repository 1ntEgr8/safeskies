var mongoose = require("mongoose");
var User = require("../models/user");
mongoose.connect("mongodb://localhost/flight_app");

var ticketSchema = new mongoose.Schema({
    ref: String,
    description: String,
    poster:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

var Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;