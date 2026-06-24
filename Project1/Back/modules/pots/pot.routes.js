const express = require('express');
const router = express.Router();
const requireAuth = require('../auth/auth.middleware');
const { getPots, createPot, updatePot, deletePot, addMoney, withdrawMoney } = require('./pot.controller');

router.use(requireAuth);

router.get('/', getPots);
router.post('/', createPot);
router.put('/:id', updatePot);
router.delete('/:id', deletePot);
router.post('/:id/add', addMoney);
router.post('/:id/withdraw', withdrawMoney);

module.exports = router;
