const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports');

router.get('/weekly', reportsController.getWeeklyReport);

module.exports = router;
