const overviewService = require("./overview.service");

const getOverview = async (req, res) => {
  try {
    const overview = await overviewService.getOverview(req.userId);

    if (overview === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
    }

    res.json(overview);
  } catch (err) {
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
};

module.exports = { getOverview };