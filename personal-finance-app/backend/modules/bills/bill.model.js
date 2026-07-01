const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  dueDay: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
  },
  avatar: {
    type: String,
  },
  color: {
    type: String,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Bill", billSchema);
