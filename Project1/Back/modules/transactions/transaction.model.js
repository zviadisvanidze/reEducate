const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  avatar: {
    type: String
  },
  color: {
    type: String
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
