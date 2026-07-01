const express = require("express");
const router = express.Router();
const {
  getBills,
  getBillsSummary,
  createBill,
  updateBill,
  updateBillStatus,
  deleteBill,
} = require("./bill.controller");
const isAuthMiddleware = require("../middlewares/is-auth.middleware");
const validate = require("../middlewares/validate");
const { billDto, billStatusDto } = require("./bill.dto");

router.use(isAuthMiddleware);
router.get("/summary", getBillsSummary);
router.get("/", getBills);
router.post("/", validate(billDto), createBill);
router.put("/:id", validate(billDto), updateBill);
router.put("/:id/status", validate(billStatusDto), updateBillStatus);
router.delete("/:id", deleteBill);

module.exports = router;
