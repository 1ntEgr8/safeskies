var mongoose = require("mongoose");
var User = require("../models/user");
var Ticket = require("../models/ticket");
mongoose.connect("mongodb://localhost/flight_app");

var chatSchema = new mongoose.Schema({
    ticket:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket"
    },
    chat_content: String
});

var Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;