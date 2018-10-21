var express = require("express");
var bodyParser = require("body-parser");
var User = require("../models/user");
var Admin = require("../models/admin");
var Ticket = require("../models/ticket");
var Chat = require("../models/chat");
var mongoose = require("mongoose");
var methodOverride = require("method-override");

var translateClient = require("../translate/script.js");
mongoose.connect("mongodb://localhost/flight_app");


module.exports= function(app){
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use(methodOverride("_method"));
    
    app.set("view engine","ejs");
    
    
    app.get("/",function(req,res){
       res.render("index") ;
    });
    
    app.get("/signatures",function(req,res){
       res.render("signature"); 
    });
    
    
    //GET Ticket Dashboard page
    app.get("/dashboard",function(req, res){
       res.send("YOU ARE AT THE DASHBOARD"); 
    });
    
    //GET New ticket page
    app.get("/dashboard/ticket/new",function(req,res){
        if(req.session.userId){
            User.findById(req.session.userId,function(err, user){
                res.render("ticket", {user: user});
            })
        }
        else{
            res.redirect("/signin");
        }
        
    });
    
    //GET Admin Ticket Chat
    app.get("/admin/dashboard/ticket/chat/:id",function(req,res){
       if(req.session.userId){
           Ticket.findById(req.params.id, function(err, ticket){
               if(err){
                   console.log(err);
               }
               else{
                   Chat.findOne({ticket:ticket}).populate("ticket").exec(function(err, chat){
                      if(err){
                          console.log(err);
                      } 
                      else{
                          console.log("ticket to pass", ticket);
                          res.render("admin-chat",{chat: chat,ticket:ticket});
                      }
                   });
                   
                   
               }
               
           });
       } 
       else{
           res.redirect('/admin/login');
       }
    });
    
    
    //DELETE User Ticket 
    app.delete("/admin/dashboard/ticket/chat/:id",function(req,res){
       if(req.session.userId){
           Ticket.findOne({_id:req.params.id}).populate("poster").exec(function(err, ticket){
               if(err){
                   console.log(err);
               }
               else{
                   User.findById(ticket.poster._id,function(err, user){
                       if(err){
                           console.log(err);
                       }
                       else{
                           user.tickets.remove(ticket);
                           user.save(function(err, savedUser){
                               if(err){
                                   console.log(err);
                               }
                               else{
                                   Chat.findOne({ticket: ticket}, function(err, chat){
                                       if(err){
                                           console.log(err);
                                       }
                                       else{
                                           chat.delete(function(err){
                                               if(err){
                                                   console.log(err);
                                               }
                                               else{
                                                   ticket.delete(function(err){
                                                       if(err){
                                                           console.log(err);
                                                       }
                                                       else{
                                                           res.redirect("/admin/dashboard");
                                                       }
                                                   });
                                               }
                                           })
                                       }
                                   })
                                   
                                   
                               }
                           })
                           
                       }
                   });
                   
               }
               
           });
       } 
       else{
           res.redirect('/signin');
       }
    });
    
    //GET Open Ticket Chat
    app.get("/dashboard/ticket/chat/:id",function(req,res){
       if(req.session.userId){
           Ticket.findById(req.params.id, function(err, ticket){
               if(err){
                   console.log(err);
               }
               else{
                   Chat.findOne({ticket:ticket}).populate("ticket").exec(function(err, chat){
                      if(err){
                          console.log(err);
                      } 
                      else{
                          //console.log("chat to render", chat);
                          res.render("public-chat",{chat: chat})
                      }
                   });
                   
                   
               }
               
           });
       } 
       else{
           res.redirect('/signin');
       }
    });
    
    //POST New Ticket
    app.post("/dashboard/ticket",function(req,res){
        if(req.session.userId){
            User.findById(req.session.userId, function(err,user){
                if(err){
                    console.log(err);
                }
                else{
                translateClient.detect(req.body.ticket_reason).then(function(results){
                    let detections = results[0];
                    detections = Array.isArray(detections) ? detections : [detections];
                    user.language = detections[0].language;
                });
                   Ticket.count(function(err, count){
                        if(err){
                            console.log(err);
                        }
                        else{
                            var refNum = "#TX"+("0000" + (count+1)).slice(-4);
                            translateClient.translate(req.body.ticket_reason,'en').then(function(results){
                                var newTicket = {description: results[0], ref:refNum, poster: user};
                            Ticket.create(newTicket, function(err, ticket){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    
                                    user.tickets.push(ticket);
                                    
                                    user.save(function(err, savedUser){
                                        if(err){
                                            console.log(err);
                                        }
                                        else{
                                            console.log("Ticket saved for user "+ user.first_name +" "+user.last_name);
                                            Chat.create({ticket: ticket, chat_content: "{ \"messages\":[] }"}, function(err, chat){
                                                if(err){
                                                    console.log(err);
                                                }
                                                else{
                                                    console.log("Created chat for ticket "+ticket.ref);
                                                    res.redirect("/dashboard/ticket/chat/"+ticket._id);
                                                }
                                                
                                            })
                                            
                                        }
                                    })
                                }
                            });
                            });
                            
                        }
                    });
                    /*
                    */
                }
            });
        }
        else{
            res.redirect("/signin");
        }
    });
    
    //GET Complete page
    app.get("/dashboard/ticket/completed", function(req,res){
        if(req.session.userId){
            res.render("endchatpage");
        }
        else{
            res.render("/signin");
        }
    })
    
    //GET Admin login page
    app.get("/admin/login",function(req,res){
       if(req.session.userId){
           Admin.findById(req.session.userId,function(err, admin_user){
               if(err){
                   console.log(err);
               }
               if(admin_user){
                   res.redirect("/admin/dashboard");
               }
               else{
                   res.redirect("/dashboard/ticket/new");
               }
           });
           
       } 
       else{
           res.render("admin-login");
       }
    });
    
    //GET Admin dashboard
    app.get("/admin/dashboard",function(req,res){
        if(req.session.userId){
            Admin.findById(req.session.userId, function(err, admin_user){
               if(err){
                   console.log(err);
                   res.redirect("/admin/login");
               } 
               else{
                   Ticket.find({}).populate("poster").exec(function(err, tickets){
                       if(err){
                           console.log(err);
                       }
                       else{
                           //console.log("tickets for dashboard", tickets);
                           res.render("admin-dashboard",{tickets:tickets});
                       }
                   });
               }
            });
        }
        else{
            res.redirect("/admin/login");
        }
    });
    
    
    //GET Admin signup page
    app.get("/admin/login",function(req,res){
       if(req.session.userId){
           res.redirect("/admin/dashboard");
       } 
       else{
           
       }
    });
    
    //POST Admin login/signup page
    app.post("/admin/login",function(req,res){
       if(req.session.userId){
           res.redirect("/admin/dashboard");
       } 
       else{
           if(req.body.username && req.body.password){
               var userData = {
                  username: req.body.username,
                  password: req.body.password
                }
        
                Admin.create(userData, function (error, admin_user) {
                  if (error) {
                    console.log(error);
                  } else {
                    req.session.userId = admin_user._id;
                    res.redirect("/admin/dashboard");
                  }
                });
           }
           else if(req.body.logusername && req.body.logpassword){
               Admin.authenticate(req.body.logusername, req.body.logpassword, function (error, admin_user) {
                  if (error || !admin_user) {
                    var err = new Error('Wrong email or password.');
                    err.status = 401;
                    console.log(err);
                  } else {
                    req.session.userId = admin_user._id;
                    res.redirect("/admin/dashboard");
                  }
                });
           }
           else{
               res.send("MISSING USERNAME OR PASSWORD");
           }
       }
    });
    
    
    
    //GET User Signin page
    app.get("/signin", function(req,res){
       if(req.session.userId){
           res.redirect("/dashboard/ticket/new");
       }
       else{
           res.render("public-signin");
       }
    });
    //POST User Signin data
    app.post("/signin",function(req,res){
        //console.log(req.body);
        if(req.body.first_name && req.body.last_name && req.body.seat_num){
            var currentUser = {first_name: req.body.first_name, last_name: req.body.last_name, seat: req.body.seat_num};
            User.findOne(currentUser,function(err, user){
                if(err){
                    console.log(err);
                }
                else{
                    if(user){
                        console.log("Returning user logging in...");
                        req.session.userId = user._id;
                        res.redirect("/dashboard/ticket/new");
                    }
                    else{
                        User.create(currentUser, function(err,user){
                            if(err){
                                console.log(err);
                            }
                            else{
                                console.log("New user account being created");
                                req.session.userId = user._id;
                                res.redirect("/dashboard/ticket/new");
                            }
                            
                        });
                    }
                }
            })
            
            
        }
        else{
            res.send("MISSING FIRST OR LAST NAME");
        }
    });
};