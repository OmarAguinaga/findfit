const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply and email address'
  },
  name: {
    type: String,
    required: 'please supply a name',
    trim: true
  }
});

userSchema.virtual('gravatar').get(function() {
  const hash = md5('this.email');
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

// Add pluinfot he password field
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// Enhance errors
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
