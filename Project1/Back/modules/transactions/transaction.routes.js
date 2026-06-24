const express = require('express');
const router = express.Router();
const requireAuth = require('../auth/auth.middleware');
const { getTransactions, createTransaction } = require('./transaction.controller');

router.use(requireAuth);

router.get('/', getTransactions);
router.post('/', createTransaction);

module.exports = router;
