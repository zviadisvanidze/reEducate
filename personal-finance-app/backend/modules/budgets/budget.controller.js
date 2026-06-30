const budgetService = require("./budget.service");

const getBudgets = async (req, res) => {
  try {
    const budgets = await budgetService.getBudgets(req.userId);
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
};

const createBudget = async (req, res) => {
  try {
    const { category, maximum, theme } = req.body;

    if (!category || !maximum || !theme) {
      return res
        .status(400)
        .json({ message: "სავალდებულო ველები: category, maximum, theme" });
    }

    const budget = await budgetService.createBudget({
      userId: req.userId,
      category,
      maximum,
      theme,
    });

    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { category, maximum, theme } = req.body;

    const budget = await budgetService.updateBudget({
      userId: req.userId,
      id: req.params.id,
      category,
      maximum,
      theme,
    });

    if (!budget) {
      return res.status(404).json({ message: "ბიუჯეტი ვერ მოიძებნა" });
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await budgetService.deleteBudget({
      userId: req.userId,
      id: req.params.id,
    });

    if (!budget) {
      return res.status(404).json({ message: "ბიუჯეტი ვერ მოიძებნა" });
    }

    res.json({ message: "ბიუჯეტი წაშლილია" });
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };