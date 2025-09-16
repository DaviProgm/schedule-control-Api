const router = require('express').Router();
const WebhookController = require('../controllers/WebhookController');

router.post('/webhooks/asaas', WebhookController.handleAsaasWebhook);

module.exports = router;
