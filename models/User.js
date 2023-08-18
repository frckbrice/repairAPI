const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    require: [true, "A user must have a user name"],
  },

  password: {
    type: String,
    require: [true, "A user must have a password"],
  },
  roles: [{
    type: String,
    default:'Employee'
  }],
  active: {
    type: Boolean,
    default: true,
  }
});

module.exports = mongoose.model("user", userSchema);