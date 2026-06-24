const mongoose = require('mongoose');

const potSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  saved: {
    type: Number,
    default: 0
  },
  theme: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Pot', potSchema);
