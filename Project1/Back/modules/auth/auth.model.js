const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 4836.00
  }
});

userSchema.pre('save', async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      'userId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
