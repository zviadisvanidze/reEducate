const express = require('express');
const router = express.Router();
const requireAuth = require('../auth/auth.middleware');
const { getOverview } = require('./overview.controller');

router.use(requireAuth);

router.get('/', getOverview);

module.exports = router;
