const potService = require("./pot.service");

const getPots = async (req, res) => {
  try {
    const pots = await potService.getPots(req.userId);
    res.json(pots);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const createPot = async (req, res) => {
  try {
    const { name, target, theme } = req.body;

    if (!name || !target || !theme) {
      return res.status(400).json({ message: "Required fields: name, target, theme" });
    }

    const pot = await potService.createPot({
      userId: req.userId,
      name,
      target,
      theme,
    });

    res.status(201).json(pot);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updatePot = async (req, res) => {
  try {
    const { name, target, theme } = req.body;

    const pot = await potService.updatePot({
      userId: req.userId,
      id: req.params.id,
      name,
      target,
      theme,
    });

    if (!pot) {
      return res.status(404).json({ message: "Pot not found" });
    }

    res.json(pot);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deletePot = async (req, res) => {
  try {
    const result = await potService.deletePot({
      userId: req.userId,
      id: req.params.id,
    });

    if (!result) {
      return res.status(404).json({ message: "Pot not found" });
    }

    res.json({
      message: "Pot deleted and saved money returned to balance",
      refundedAmount: result.refundedAmount,
      balance: result.balance,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const addMoney = async (req, res) => {
  try {
    const result = await potService.addMoney({
      userId: req.userId,
      id: req.params.id,
      amount: Number(req.body.amount),
    });

    if (result === "INVALID_AMOUNT") {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (result === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    if (result === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (result === "POT_NOT_FOUND") {
      return res.status(404).json({ message: "Pot not found" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const withdrawMoney = async (req, res) => {
  try {
    const result = await potService.withdrawMoney({
      userId: req.userId,
      id: req.params.id,
      amount: Number(req.body.amount),
    });

    if (result === "INVALID_AMOUNT") {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (result === "POT_NOT_FOUND") {
      return res.status(404).json({ message: "Pot not found" });
    }

    if (result === "INSUFFICIENT_POT_BALANCE") {
      return res.status(400).json({ message: "Insufficient funds in pot" });
    }

    if (result === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPots, createPot, updatePot, deletePot, addMoney, withdrawMoney };
