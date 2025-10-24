// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const { sendNotification, saveNotificationToken } = require("../controllers/notificationController");

/**
 * @swagger
 * /send-notification:
 *   post:
 *     summary: Envia uma notificação (requer autenticação)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - body
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID do usuário para quem a notificação será enviada
 *                 example: "user123"
 *               title:
 *                 type: string
 *                 description: Título da notificação
 *                 example: "Novo Agendamento"
 *               body:
 *                 type: string
 *                 description: Corpo da notificação
 *                 example: "Você tem um novo agendamento para amanhã."
 *     responses:
 *       200:
 *         description: Notificação enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notificação enviada com sucesso.
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/send-notification", sendNotification);
/**
 * @swagger
 * /token:
 *   post:
 *     summary: Salva o token de notificação de um usuário
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID do usuário associado ao token
 *                 example: "user123"
 *               token:
 *                 type: string
 *                 description: Token de notificação (FCM, APN, etc.)
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *     responses:
 *       200:
 *         description: Token de notificação salvo com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token de notificação salvo com sucesso.
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/token", saveNotificationToken);

module.exports = router;
