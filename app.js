var express = require("express");
var mongoose = require("mongoose");
var session = require("express-session");
var app = express();
var MongoStore = require('connect-mongo')(session);
var sio = require("socket.io");
var User = require("./models/user.js");
var Ticket = require("./models/ticket.js");
var Chat = require("./models/chat.js");
mongoose.connect("mongodb://localhost/flight_app");
var methodOverride = require("method-override");
var translateClient = require("./translate/script.js");
var db = mongoose.connection;
var cookie = require("cookie");

var sessionMiddleware = session({
  secret: 'flysafe',
  resave: true,
  saveUninitialized: false,
  name: "session",
  store: new MongoStore({
    mongooseConnection: db
  })
});

app.use(sessionMiddleware);
app.use(methodOverride("_method"));

var routes = require("./routes/router.js")(app);

var server = app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started");
});

// create socket server
var io = sio.listen(server);

// set socket.io debugging
io.set('log level', 1);

io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});


io.sockets.on('connection', function (socket) {
    if(socket.handshake.headers["user-type"] === "user"){
      
      User.findById(socket.request.session.userId, function(err, user){
        if(err){
          console.log(err);
        }
        else{
           socket.username = user.first_name +" "+user.last_name;}
      });
    }
    else if(socket.handshake.headers["user-type"]  ==="admin"){
      socket.username = "Flight Attendant";
    }
    socket.on('new_message',function(data){
      var ticket_ref = socket.handshake.headers["ticket-ref"].toString();
      Ticket.findOne({ref:ticket_ref}).populate("poster").exec(function(err, ticket){
        if(data.message !== "new_ticket" && data.message !=="closing"){
          if(socket.username !== "Flight Attendant"){
            translateClient.translate(data.message.user_message, 'en').then(function(results){
              Chat.findOne({ticket:ticket},function(err, chat){
                var chatJSON = JSON.parse(chat.chat_content);
                data.message.admin_message = results[0];
                chatJSON.messages.push({username:socket.username, message: {user_message: data.message.user_message, admin_message: data.message.admin_message}});
                chat.chat_content= JSON.stringify(chatJSON);
                chat.ticket = ticket;
                chat.save(function(err){
                  if(err){
                    console.log(err);
                  }
                  else{
                      io.sockets.emit('new_message',{message: data.message,username:socket.username, ticket_ref: ticket_ref});
                  }
                })
              });
            });
          }
          else{
            translateClient.translate(data.message.admin_message, ticket.poster.language).then(function(results){
              Chat.findOne({ticket:ticket},function(err, chat){
                var chatJSON = JSON.parse(chat.chat_content);
                data.message.user_message = results[0];
                chatJSON.messages.push({username:socket.username, message: {user_message: data.message.user_message, admin_message: data.message.admin_message}});
                chat.chat_content= JSON.stringify(chatJSON);
                chat.ticket = ticket;
                chat.save(function(err){
                  if(err){
                    console.log(err);
                  }
                  else{
                      io.sockets.emit('new_message',{message: data.message,username:socket.username, ticket_ref: ticket_ref});
                  }
                })
              });
            });
          }
        }
        else if(data.message ==="closing"){
            io.sockets.emit('new_message',{message: "closing", username: socket.username,ticket_ref: ticket_ref});
        }
        else{
          io.sockets.emit('new_message',{message: "new_ticket",ticket: ticket});
        }
        
      });
      
    });
    
});



