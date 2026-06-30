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

exports.deletePot = ({ userId, id }) => {
  return Pot.findOneAndDelete({ _id: id, userId });
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