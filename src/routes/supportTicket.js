const express = require('express');
const router = express.Router();
const { createSupportTicket } = require('../controllers/supportTicket');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createSupportTicket);

module.exports = router;
