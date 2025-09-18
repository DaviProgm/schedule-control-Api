const router = require('express').Router();
const WebhookController = require('../controllers/WebhookController');
const asaasAuth = require('../middleware/asaasAuth');

// src/routes/webhook.js
router.post('/webhook/asaas', asaasAuth, WebhookController.handleAsaasWebhook);


module.exports = router;
