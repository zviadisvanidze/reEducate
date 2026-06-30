const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDay: {
    type: Number,
    required: true
  },
  avatar: {
    type: String
  },
  color: {
    type: String
  },
  isPaid: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Bill', billSchema);
