const express = require('express');
const router = express.Router();
const { createSupportTicket } = require('../controllers/supportTicket');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /support-tickets:
 *   post:
 *     summary: Cria um novo ticket de suporte
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Problema com agendamento
 *               message:
 *                 type: string
 *                 example: Não consigo visualizar meus agendamentos.
 *     responses:
 *       201:
 *         description: Ticket de suporte criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticket de suporte criado com sucesso.
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "ticket_123"
 *                     subject:
 *                       type: string
 *                       example: "Problema com agendamento"
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', authMiddleware, createSupportTicket);

module.exports = router;
