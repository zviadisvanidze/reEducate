const express = require('express');
const router = express.Router();
const requireAuth = require('../auth/auth.middleware');
const { getBills, getBillsSummary } = require('./bill.controller');

router.use(requireAuth);

router.get('/summary', getBillsSummary);
router.get('/', getBills);

module.exports = router;
