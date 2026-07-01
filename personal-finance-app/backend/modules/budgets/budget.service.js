const Budget = require("./budget.model");
const Transaction = require("../transactions/transaction.model");

const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

exports.getBudgets = async (userId) => {
  const budgets = await Budget.find({ userId });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return Promise.all(
    budgets.map(async (budget) => {
      const transactions = await Transaction.find({
        senderId: userId,
        category: budget.category,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      })
        .populate("receiverId", "name avatar")
        .sort({ date: -1 });

      const spent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const latestSpending = transactions.slice(0, 3).map((transaction) => {
        const isMerchant = transaction.transactionType === "merchant";
        return {
          _id: transaction._id,
          name: isMerchant
            ? transaction.counterpartyName
            : transaction.receiverId
              ? transaction.receiverId.name
              : "Unknown user",
          avatar: isMerchant
            ? initials(transaction.counterpartyName)
            : transaction.receiverId
              ? transaction.receiverId.avatar
              : "",
          amount: -Math.abs(transaction.amount),
          category: transaction.category,
          date: transaction.date,
          color: transaction.color,
        };
      });

      return {
        _id: budget._id,
        category: budget.category,
        maximum: budget.maximum,
        theme: budget.theme,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(Math.max(budget.maximum - spent, 0) * 100) / 100,
        latestSpending,
      };
    }),
  );
};

exports.createBudget = ({ userId, category, maximum, theme }) => {
  return Budget.create({ userId, category, maximum, theme });
};

exports.updateBudget = ({ userId, id, category, maximum, theme }) => {
  return Budget.findOneAndUpdate(
    { _id: id, userId },
    { category, maximum, theme },
    { new: true },
  );
};

exports.deleteBudget = ({ userId, id }) => {
  return Budget.findOneAndDelete({ _id: id, userId });
};
