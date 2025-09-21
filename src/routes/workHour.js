const express = require('express');
const router = express.Router();
const workHourController = require('../controllers/workHour.js');
const authMiddleware = require('../middleware/auth.js');

// All routes in this file are protected
router.use(authMiddleware);

// Routes for /work-hours
router.route('/')
  .get(workHourController.getWorkHours)
  .post(workHourController.setWorkHours);

module.exports = router;
