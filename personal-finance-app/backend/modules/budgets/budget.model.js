const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  maximum: {
    type: Number,
    required: true
  },
  theme: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Budget', budgetSchema);
