const User = require("../auth/auth.model");
const Transaction = require("../transactions/transaction.model");
const Budget = require("../budgets/budget.model");
const Pot = require("../pots/pot.model");
const Bill = require("../bills/bill.model");
const { isDueSoon } = require("../bills/bill.service");

exports.getOverview = async (userId) => {
  const currentUserId = userId.toString();
  const populatedId = (value) => value && (value._id || value);

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return "USER_NOT_FOUND";
  }

  const transactions = await Transaction.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .populate("senderId", "name avatar")
    .populate("receiverId", "name avatar");

  const income = transactions
    .filter((t) => {
      const id = populatedId(t.receiverId);
      return id && id.toString() === currentUserId;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const expenses = transactions
    .filter((t) => {
      const id = populatedId(t.senderId);
      return id && id.toString() === currentUserId;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const latestTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((transaction) => {
      const item = transaction.toObject();
      const senderId = populatedId(item.senderId);
      const isSender = senderId && senderId.toString() === currentUserId;
      const otherUser = isSender ? item.receiverId : item.senderId;
      const isMerchant = item.transactionType === "merchant";
      const merchantAvatar = isMerchant
        ? item.counterpartyName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
        : "";

      return {
        _id: item._id,
        name: isMerchant
          ? item.counterpartyName
          : otherUser && otherUser.name
            ? otherUser.name
            : "Unknown user",
        avatar: isMerchant
          ? merchantAvatar
          : otherUser && otherUser.avatar
            ? otherUser.avatar
            : "",
        amount: isSender ? -Math.abs(item.amount) : Math.abs(item.amount),
        category: item.category,
        date: item.date,
        color: item.color,
        type: isSender ? "sent" : "received",
      };
    });

  const pots = await Pot.find({ userId });
  const totalSaved = pots.reduce((sum, p) => sum + p.saved, 0);

  const budgets = await Budget.find({ userId });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const budgetsSummary = await Promise.all(
    budgets.map(async (budget) => {
      const budgetTransactions = await Transaction.find({
        senderId: userId,
        category: budget.category,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const spent = budgetTransactions.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0,
      );

      return {
        category: budget.category,
        maximum: budget.maximum,
        theme: budget.theme,
        spent: Math.round(spent * 100) / 100,
      };
    }),
  );

  const bills = await Bill.find({ userId });

  let billsPaid = 0;
  let billsUpcoming = 0;
  let billsDueSoon = 0;

  bills.forEach((bill) => {
    if (bill.isPaid) {
      billsPaid += bill.amount;
    } else if (isDueSoon(bill.dueDay)) {
      billsDueSoon += bill.amount;
    } else {
      billsUpcoming += bill.amount;
    }
  });

  return {
    balance: user.balance,
    income: Math.round(income * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    pots: {
      items: pots,
      totalSaved: Math.round(totalSaved * 100) / 100,
    },
    latestTransactions,
    budgets: budgetsSummary,
    bills: {
      paid: Math.round(billsPaid * 100) / 100,
      upcoming: Math.round(billsUpcoming * 100) / 100,
      dueSoon: Math.round(billsDueSoon * 100) / 100,
    },
  };
};
