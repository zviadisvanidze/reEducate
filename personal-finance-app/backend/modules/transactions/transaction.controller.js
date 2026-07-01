const transactionService = require("./transaction.service");

const getTransactions = async (req, res) => {
  try {
    const result = await transactionService.getTransactions({
      userId: req.userId,
      query: req.query,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const createTransaction = async (req, res) => {
  try {
    const result = await transactionService.createTransaction({
      senderId: req.userId,
      ...req.body,
    });

    if (result === "MISSING_FIELDS") {
      return res.status(400).json({
        message: "Complete all required transaction fields",
      });
    }

    if (result === "SELF_TRANSFER") {
      return res.status(400).json({ message: "You cannot send money to yourself" });
    }

    if (result === "INVALID_AMOUNT") {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (result === "SENDER_NOT_FOUND") {
      return res.status(404).json({ message: "Sender not found" });
    }

    if (result === "RECEIVER_NOT_FOUND") {
      return res.status(404).json({ message: "Receiver not found" });
    }

    if (result === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTransactions, createTransaction };
