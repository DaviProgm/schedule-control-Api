const router = require('express').Router();
const WebhookController = require('../controllers/WebhookController');

// src/routes/webhook.js
router.post('/webhook/asaas', WebhookController.handleAsaasWebhook);


module.exports = router;
