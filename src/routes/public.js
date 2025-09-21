const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.js');

// Route to get a provider's public profile (services, work hours, etc.)
router.get('/provider/:username', publicController.getPublicProfile);

// Route to get availability for a provider by username
router.get('/availability/:username', publicController.getAvailability);

// Route to create a new schedule from the public page
router.post('/schedules', publicController.createPublicSchedule);

module.exports = router;
