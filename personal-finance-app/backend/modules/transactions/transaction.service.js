const mongoose = require("mongoose");
const Transaction = require("./transaction.model");
const User = require("../auth/auth.model");

const formatTransaction = (transaction, currentUserId) => {
  const item = transaction.toObject();
  const isSender = item.senderId._id.toString() === currentUserId;
  const otherUser = isSender ? item.receiverId : item.senderId;

  return {
    ...item,
    name: otherUser.name,
    avatar: otherUser.avatar,
    type: isSender ? "sent" : "received",
    displayAmount: isSender ? -item.amount : item.amount,
  };
};

exports.getTransactions = async ({ userId, query }) => {
  const { page = 1, limit = 10, search, category, sort = "latest" } = query;
  const currentUserId = userId.toString();

  const filter = {
    $or: [{ senderId: userId }, { receiverId: userId }],
  };

  if (category && category !== "All Transactions") {
    filter.category = category;
  }

  let transactions = await Transaction.find(filter)
    .populate("senderId", "name avatar")
    .populate("receiverId", "name avatar");

  transactions = transactions.map((transaction) =>
    formatTransaction(transaction, currentUserId),
  );

  if (search) {
    transactions = transactions.filter((transaction) =>
      transaction.name.toLowerCase().includes(search.toLowerCase()),
    );
  }

  switch (sort) {
    case "oldest":
      transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "a-z":
      transactions.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "z-a":
      transactions.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "highest":
      transactions.sort((a, b) => b.amount - a.amount);
      break;
    case "lowest":
      transactions.sort((a, b) => a.amount - b.amount);
      break;
    default:
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const total = transactions.length;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  return {
    transactions: transactions.slice(skip, skip + limitNumber),
    currentPage: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
    total,
  };
};

exports.createTransaction = async ({ senderId, receiverId, category, amount, color }) => {
  if (!receiverId || !category || amount === undefined) {
    return "MISSING_FIELDS";
  }

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return "INVALID_RECEIVER";
  }

  if (receiverId === senderId.toString()) {
    return "SELF_TRANSFER";
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "INVALID_AMOUNT";
  }

  const sender = await User.findOneAndUpdate(
    { _id: senderId, balance: { $gte: numericAmount } },
    { $inc: { balance: -numericAmount } },
    { new: true },
  );

  if (!sender) {
    const senderExists = await User.exists({ _id: senderId });
    return senderExists ? "INSUFFICIENT_BALANCE" : "SENDER_NOT_FOUND";
  }

  const receiver = await User.findByIdAndUpdate(
    receiverId,
    { $inc: { balance: numericAmount } },
    { new: true },
  );

  if (!receiver) {
    await User.findByIdAndUpdate(senderId, { $inc: { balance: numericAmount } });
    return "RECEIVER_NOT_FOUND";
  }

  try {
    const transaction = await Transaction.create({
      senderId,
      receiverId,
      category,
      amount: numericAmount,
      color,
    });

    return Transaction.findById(transaction._id)
      .populate("senderId", "name avatar balance")
      .populate("receiverId", "name avatar balance");
  } catch (err) {
    await User.findByIdAndUpdate(senderId, { $inc: { balance: numericAmount } });
    await User.findByIdAndUpdate(receiverId, { $inc: { balance: -numericAmount } });
    throw err;
  }
};