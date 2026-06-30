const express = require("express");
const router = express.Router();
const isAuthMiddleware = require("../middlewares/is-auth.middleware");

const {
  getTransactions,
  createTransaction,
} = require("./transaction.controller");

router.use(isAuthMiddleware);
router.get("/", getTransactions);
router.post("/", createTransaction);

module.exports = router;
