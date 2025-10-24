const router = require('express').Router();
const SubscriptionController = require('../controllers/SubscriptionController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Cria uma nova assinatura para o usuário autenticado
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 example: "basic_plan_id"
 *     responses:
 *       201:
 *         description: Assinatura criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assinatura criada com sucesso
 *                 subscription:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "sub_123xyz"
 *                     userId:
 *                       type: string
 *                       example: "user_abc"
 *                     planId:
 *                       type: string
 *                       example: "basic_plan_id"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Dados inválidos ou plano não encontrado
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/subscriptions', SubscriptionController.createSubscription);

/**
 * @swagger
 * /subscription:
 *   get:
 *     summary: Retorna a assinatura ativa do usuário autenticado
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assinatura retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "sub_123xyz"
 *                 userId:
 *                   type: string
 *                   example: "user_abc"
 *                 planId:
 *                   type: string
 *                   example: "basic_plan_id"
 *                 status:
 *                   type: string
 *                   example: "active"
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-27T10:00:00Z"
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-10-27T10:00:00Z"
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Nenhuma assinatura encontrada para o usuário
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/subscription', SubscriptionController.getSubscription);

/**
 * @swagger
 * /subscription:
 *   delete:
 *     summary: Cancela a assinatura ativa do usuário autenticado
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assinatura cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assinatura cancelada com sucesso.
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Nenhuma assinatura ativa encontrada para o usuário
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/subscription', SubscriptionController.cancelSubscription);

module.exports = router;
