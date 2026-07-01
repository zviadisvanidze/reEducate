const billService = require("./bill.service");

const getBillsSummary = async (req, res) => {
  try {
    const summary = await billService.getBillsSummary(req.userId);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getBills = async (req, res) => {
  try {
    const bills = await billService.getBills({
      userId: req.userId,
      search: req.query.search,
      sort: req.query.sort,
    });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const createBill = async (req, res) => {
  try {
    const bill = await billService.createBill({
      userId: req.userId,
      ...req.body,
    });
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateBill = async (req, res) => {
  try {
    const bill = await billService.updateBill({
      userId: req.userId,
      id: req.params.id,
      ...req.body,
    });
    if (!bill) {
      return res.status(404).json({ message: "Recurring bill not found" });
    }
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateBillStatus = async (req, res) => {
  try {
    const bill = await billService.updateBillStatus({
      userId: req.userId,
      id: req.params.id,
      isPaid: req.body.isPaid,
    });
    if (!bill) {
      return res.status(404).json({ message: "Recurring bill not found" });
    }
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteBill = async (req, res) => {
  try {
    const bill = await billService.deleteBill({
      userId: req.userId,
      id: req.params.id,
    });
    if (!bill) {
      return res.status(404).json({ message: "Recurring bill not found" });
    }
    res.json({ message: "Recurring bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getBills,
  getBillsSummary,
  createBill,
  updateBill,
  updateBillStatus,
  deleteBill,
};
