const potService = require("./pot.service");

const getPots = async (req, res) => {
  try {
    const pots = await potService.getPots(req.userId);
    res.json(pots);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
};

const createPot = async (req, res) => {
  try {
    const { name, target, theme } = req.body;

    if (!name || !target || !theme) {
      return res.status(400).json({ message: "სავალდებულო ველები: name, target, theme" });
    }

    const pot = await potService.createPot({
      userId: req.userId,
      name,
      target,
      theme,
    });

    res.status(201).json(pot);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
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
      return res.status(404).json({ message: "ქოთანი ვერ მოიძებნა" });
    }

    res.json(pot);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
};

const deletePot = async (req, res) => {
  try {
    const pot = await potService.deletePot({ userId: req.userId, id: req.params.id });

    if (!pot) {
      return res.status(404).json({ message: "ქოთანი ვერ მოიძებნა" });
    }

    res.json({ message: "ქოთანი წაშლილია" });
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
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
      return res.status(400).json({ message: "თანხა უნდა იყოს 0-ზე მეტი" });
    }

    if (result === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
    }

    if (result === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({ message: "არასაკმარისი ბალანსი" });
    }

    if (result === "POT_NOT_FOUND") {
      return res.status(404).json({ message: "ქოთანი ვერ მოიძებნა" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
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
      return res.status(400).json({ message: "თანხა უნდა იყოს 0-ზე მეტი" });
    }

    if (result === "POT_NOT_FOUND") {
      return res.status(404).json({ message: "ქოთანი ვერ მოიძებნა" });
    }

    if (result === "INSUFFICIENT_POT_BALANCE") {
      return res.status(400).json({ message: "ქოთანში არასაკმარისი თანხაა" });
    }

    if (result === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
};

module.exports = { getPots, createPot, updatePot, deletePot, addMoney, withdrawMoney };