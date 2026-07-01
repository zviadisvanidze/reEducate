const Transaction = require("./transaction.model");
const User = require("../auth/auth.model");

const transactionTimestamp = (transaction) => {
  const date = new Date(transaction.date);
  if (Number.isFinite(date.getTime())) {
    return date;
  }

  if (transaction._id && typeof transaction._id.getTimestamp === "function") {
    return transaction._id.getTimestamp();
  }

  return new Date(0);
};

const formatTransaction = (transaction, currentUserId) => {
  const item = transaction.toObject();
  const hasRecordedDate =
    typeof transaction.$isDefault !== "function" ||
    !transaction.$isDefault("date");
  const senderId = item.senderId && (item.senderId._id || item.senderId);
  const isSender = senderId && senderId.toString() === currentUserId;
  const otherUser = isSender ? item.receiverId : item.senderId;

  return {
    ...item,
    name: otherUser && otherUser.name ? otherUser.name : "Unknown user",
    avatar: otherUser && otherUser.avatar ? otherUser.avatar : "",
    type: isSender ? "sent" : "received",
    displayAmount: isSender ? -item.amount : item.amount,
    date: hasRecordedDate
      ? transactionTimestamp(item)
      : transactionTimestamp({ _id: item._id }),
    hasRecordedDate,
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

  if (sort === "received") {
    transactions = transactions.filter(
      (transaction) => transaction.type === "received",
    );
  } else if (sort === "sent") {
    transactions = transactions.filter(
      (transaction) => transaction.type === "sent",
    );
  }

  const newestFirst = (a, b) => {
    if (a.hasRecordedDate !== b.hasRecordedDate) {
      return Number(b.hasRecordedDate) - Number(a.hasRecordedDate);
    }
    const dateDifference =
      transactionTimestamp(b).getTime() - transactionTimestamp(a).getTime();
    return dateDifference || b._id.toString().localeCompare(a._id.toString());
  };

  const oldestFirst = (a, b) => {
    if (a.hasRecordedDate !== b.hasRecordedDate) {
      return Number(a.hasRecordedDate) - Number(b.hasRecordedDate);
    }
    const dateDifference =
      transactionTimestamp(a).getTime() - transactionTimestamp(b).getTime();
    return dateDifference || a._id.toString().localeCompare(b._id.toString());
  };

  switch (sort) {
    case "oldest":
      transactions.sort(oldestFirst);
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
    case "received":
    case "sent":
      transactions.sort(newestFirst);
      break;
    default:
      transactions.sort(newestFirst);
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

exports.createTransaction = async ({
  senderId,
  receiverEmail,
  category,
  amount,
  color,
}) => {
  if (!receiverEmail || !category || amount === undefined || !color) {
    return "MISSING_FIELDS";
  }

  const receiver = await User.findOne({
    email: receiverEmail.trim().toLowerCase(),
  });
  if (!receiver) {
    return "RECEIVER_NOT_FOUND";
  }

  if (receiver._id.toString() === senderId.toString()) {
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

  const updatedReceiver = await User.findByIdAndUpdate(
    receiver._id,
    { $inc: { balance: numericAmount } },
    { new: true },
  );

  if (!updatedReceiver) {
    await User.findByIdAndUpdate(senderId, { $inc: { balance: numericAmount } });
    return "RECEIVER_NOT_FOUND";
  }

  try {
    const transaction = await Transaction.create({
      senderId,
      receiverId: receiver._id,
      category,
      amount: numericAmount,
      color,
    });

    return Transaction.findById(transaction._id)
      .populate("senderId", "name avatar balance")
      .populate("receiverId", "name avatar balance");
  } catch (err) {
    await User.findByIdAndUpdate(senderId, { $inc: { balance: numericAmount } });
    await User.findByIdAndUpdate(receiver._id, { $inc: { balance: -numericAmount } });
    throw err;
  }
};
