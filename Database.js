const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

dotenv.config({ path: './config.env' });

const DB = process.env.Database.replace('<db_password>', process.env.Password);
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('DB connected');
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Rank:{type: String},
  Shift:{type: String}
});

UserSchema.methods.CreateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/*

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
*/

const User = mongoose.model('User', UserSchema);

const verify = function (token) {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { User, verify };
