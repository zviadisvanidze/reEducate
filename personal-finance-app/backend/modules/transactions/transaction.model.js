const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  amount: {
    type: Number,
    required: true,
  },

  color: {
    type: String,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
