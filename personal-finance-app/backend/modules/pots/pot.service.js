const mongoose = require("mongoose");
const Pot = require("./pot.model");
const User = require("../auth/auth.model");

exports.getPots = (userId) => {
  return Pot.find({ userId });
};

exports.createPot = ({ userId, name, target, theme }) => {
  return Pot.create({ userId, name, target, saved: 0, theme });
};

exports.updatePot = ({ userId, id, name, target, theme }) => {
  return Pot.findOneAndUpdate(
    { _id: id, userId },
    { name, target, theme },
    { new: true },
  );
};

exports.deletePot = async ({ userId, id }) => {
  const session = await mongoose.startSession();
  let result = null;

  try {
    await session.withTransaction(async () => {
      const pot = await Pot.findOne({ _id: id, userId }).session(session);
      if (!pot) {
        return;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: pot.saved } },
        { session, returnDocument: "after" },
      );
      if (!user) {
        throw new Error("User not found while deleting pot");
      }

      await Pot.deleteOne({ _id: pot._id, userId }, { session });
      result = {
        pot,
        refundedAmount: pot.saved,
        balance: user.balance,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

exports.addMoney = async ({ userId, id, amount }) => {
  if (!amount || amount <= 0) {
    return "INVALID_AMOUNT";
  }

  const user = await User.findById(userId);
  if (!user) {
    return "USER_NOT_FOUND";
  }

  if (amount > user.balance) {
    return "INSUFFICIENT_BALANCE";
  }

  const pot = await Pot.findOne({ _id: id, userId });
  if (!pot) {
    return "POT_NOT_FOUND";
  }

  pot.saved += amount;
  user.balance -= amount;

  await pot.save();
  await user.save();

  return { pot, balance: user.balance };
};

exports.withdrawMoney = async ({ userId, id, amount }) => {
  if (!amount || amount <= 0) {
    return "INVALID_AMOUNT";
  }

  const pot = await Pot.findOne({ _id: id, userId });
  if (!pot) {
    return "POT_NOT_FOUND";
  }

  if (amount > pot.saved) {
    return "INSUFFICIENT_POT_BALANCE";
  }

  const user = await User.findById(userId);
  if (!user) {
    return "USER_NOT_FOUND";
  }

  pot.saved -= amount;
  user.balance += amount;

  await pot.save();
  await user.save();

  return { pot, balance: user.balance };
};
