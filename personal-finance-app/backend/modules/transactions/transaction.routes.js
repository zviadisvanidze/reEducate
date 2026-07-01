const express = require("express");
const router = express.Router();
const isAuthMiddleware = require("../middlewares/is-auth.middleware");
const validate = require("../middlewares/validate");
const { createTransactionDto } = require("./transaction.dto");

const {
  getTransactions,
  createTransaction,
} = require("./transaction.controller");

router.use(isAuthMiddleware);
router.get("/", getTransactions);
router.post("/", validate(createTransactionDto), createTransaction);

module.exports = router;
