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
    required: function () {
      return this.transactionType === "user";
    },
  },

  transactionType: {
    type: String,
    enum: ["user", "merchant"],
    default: "user",
    required: true,
  },

  counterpartyName: {
    type: String,
    trim: true,
    required: function () {
      return this.transactionType === "merchant";
    },
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
