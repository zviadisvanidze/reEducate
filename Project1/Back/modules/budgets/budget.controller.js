const Budget = require('./budget.model');
const Transaction = require('../transactions/transaction.model');

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.session.userId });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const transactions = await Transaction.find({
          userId: req.session.userId,
          category: budget.category,
          amount: { $lt: 0 },
          date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const spent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const latestSpending = await Transaction.find({
          userId: req.session.userId,
          category: budget.category,
          amount: { $lt: 0 }
        })
          .sort({ date: -1 })
          .limit(3);

        return {
          _id: budget._id,
          category: budget.category,
          maximum: budget.maximum,
          theme: budget.theme,
          spent: Math.round(spent * 100) / 100,
          remaining: Math.round(Math.max(budget.maximum - spent, 0) * 100) / 100,
          latestSpending
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

const createBudget = async (req, res) => {
  try {
    const { category, maximum, theme } = req.body;

    if (!category || !maximum || !theme) {
      return res.status(400).json({ message: 'სავალდებულო ველები: category, maximum, theme' });
    }

    const budget = await Budget.create({
      userId: req.session.userId,
      category,
      maximum,
      theme
    });

    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { category, maximum, theme } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { category, maximum, theme },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'ბიუჯეტი ვერ მოიძებნა' });
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId
    });

    if (!budget) {
      return res.status(404).json({ message: 'ბიუჯეტი ვერ მოიძებნა' });
    }

    res.json({ message: 'ბიუჯეტი წაშლილია' });
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
