const User = require('../auth/auth.model');
const Transaction = require('../transactions/transaction.model');
const Budget = require('../budgets/budget.model');
const Pot = require('../pots/pot.model');
const Bill = require('../bills/bill.model');

const getOverview = async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await User.findOne({ userId }).select('-password');

    const transactions = await Transaction.find({ userId });

    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const latestTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    const pots = await Pot.find({ userId });
    const totalSaved = pots.reduce((sum, p) => sum + p.saved, 0);

    const budgets = await Budget.find({ userId });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const budgetsSummary = await Promise.all(
      budgets.map(async (budget) => {
        const budgetTransactions = await Transaction.find({
          userId,
          category: budget.category,
          amount: { $lt: 0 },
          date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const spent = budgetTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
          category: budget.category,
          maximum: budget.maximum,
          theme: budget.theme,
          spent: Math.round(spent * 100) / 100
        };
      })
    );

    const bills = await Bill.find({ userId });
    const today = new Date().getDate();

    let billsPaid = 0;
    let billsUpcoming = 0;
    let billsDueSoon = 0;

    bills.forEach((bill) => {
      if (bill.isPaid) {
        billsPaid += bill.amount;
      } else if (bill.dueDay <= today + 7 && bill.dueDay >= today) {
        billsDueSoon += bill.amount;
      } else {
        billsUpcoming += bill.amount;
      }
    });

    res.json({
      balance: user.balance,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      pots: {
        items: pots,
        totalSaved: Math.round(totalSaved * 100) / 100
      },
      latestTransactions,
      budgets: budgetsSummary,
      bills: {
        paid: Math.round(billsPaid * 100) / 100,
        upcoming: Math.round(billsUpcoming * 100) / 100,
        dueSoon: Math.round(billsDueSoon * 100) / 100
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

module.exports = { getOverview };
