const Transaction = require('./transaction.model');

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, sort = 'latest' } = req.query;

    const filter = { userId: req.session.userId };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All Transactions') {
      filter.category = category;
    }

    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { date: 1 };
        break;
      case 'a-z':
        sortOption = { name: 1 };
        break;
      case 'z-a':
        sortOption = { name: -1 };
        break;
      case 'highest':
        sortOption = { amount: -1 };
        break;
      case 'lowest':
        sortOption = { amount: 1 };
        break;
      default:
        sortOption = { date: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await Transaction.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { name, category, date, amount, avatar, color } = req.body;

    if (!name || !category || !date || amount === undefined) {
      return res.status(400).json({ message: 'სავალდებულო ველები: name, category, date, amount' });
    }

    const transaction = await Transaction.create({
      userId: req.session.userId,
      name,
      category,
      date,
      amount,
      avatar,
      color
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'სერვერის შეცდომა' });
  }
};

module.exports = { getTransactions, createTransaction };
