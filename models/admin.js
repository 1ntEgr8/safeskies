var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

mongoose.connect("mongodb://localhost/flight_app");

var AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
      },
    password: {
        type: String,
        unique: true,
        required: true
      }
});



AdminSchema.statics.authenticate = function (username, password, callback) {
  Admin.findOne({ username: username })
    .exec(function (err, admin_user) {
      if (err) {
        return callback(err)
      } else if (!admin_user) {
        var err = new Error('Admin user not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, admin_user.password, function (err, result) {
        if (result === true) {
          return callback(null, admin_user);
        } else {
          return callback();
        }
      })
    });
}
//hashing a password before saving it to the database
AdminSchema.pre("save", function (next) {
  var admin_user = this;
  bcrypt.hash(admin_user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    admin_user.password = hash;
    next();
  })
});
var Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;