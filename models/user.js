const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String  // Remember to hash passwords in a real-world application
});

const User = mongoose.model('User', userSchema);

module.exports = User;
