const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    // 'Bearer asdasdasdasdhjasdasdasd'
    const authorization = req.headers["authorization"];
    if (!authorization) {
      return res.status(401).json({ message: "permition denied" });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "permition denied" });
    }

    const payload = await jwt.verify(token, process.env.JWT_SECRET || process.env.SESSION_SECRET);
    req["userId"] = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ message: "permition denied" });
  }
};

