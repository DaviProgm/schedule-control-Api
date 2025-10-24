const router = require('express').Router();
const WebhookController = require('../controllers/WebhookController');
const asaasAuth = require('../middleware/asaasAuth');

// src/routes/webhook.js
/**
 * @swagger
 * /webhook/asaas:
 *   post:
 *     summary: Manipula webhooks da ASAAS
 *     tags: [Webhook]
 *     security:
 *       - asaasAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Estrutura do payload do webhook da ASAAS
 *             example:
 *               event: PAYMENT_RECEIVED
 *               payment:
 *                 id: "pay_000000000000"
 *                 status: "CONFIRMED"
 *                 value: 100.00
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Webhook processado com sucesso
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Não autorizado (falha na autenticação ASAAS)
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/webhook/asaas', asaasAuth, WebhookController.handleAsaasWebhook);


module.exports = router;
