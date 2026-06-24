const express = require('express');
const router = express.Router();
const requireAuth = require('../auth/auth.middleware');
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('./budget.controller');

router.use(requireAuth);

router.get('/', getBudgets);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
