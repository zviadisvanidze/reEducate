const billService = require("./bill.service");

const getBillsSummary = async (req, res) => {
  try {
    const summary = await billService.getBillsSummary(req.userId);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
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
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
};

module.exports = { getBills, getBillsSummary };