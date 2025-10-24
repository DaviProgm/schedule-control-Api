const express = require('express');
const router = express.Router();
const workHourController = require('../controllers/workHour.js');
const authMiddleware = require('../middleware/auth.js');

// All routes in this file are protected
router.use(authMiddleware);

// Routes for /work-hours
/**
 * @swagger
 * /work-hours:
 *   get:
 *     summary: Retorna as horas de trabalho do usuário autenticado
 *     tags: [Work Hours]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Horas de trabalho retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174000
 *                   userId:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174001
 *                   dayOfWeek:
 *                     type: number
 *                     example: 1
 *                   startTime:
 *                     type: string
 *                     format: time
 *                     example: "09:00"
 *                   endTime:
 *                     type: string
 *                     format: time
 *                     example: "18:00"
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.route('/')
  .get(workHourController.getWorkHours)
/**
 * @swagger
 * /work-hours:
 *   post:
 *     summary: Define ou atualiza as horas de trabalho para o usuário autenticado
 *     tags: [Work Hours]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - dayOfWeek
 *                 - startTime
 *                 - endTime
 *               properties:
 *                 dayOfWeek:
 *                   type: number
 *                   description: Dia da semana (0 para Domingo, 1 para Segunda, etc.)
 *                   example: 1
 *                 startTime:
 *                   type: string
 *                   format: time
 *                   example: "09:00"
 *                 endTime:
 *                   type: string
 *                   format: time
 *                   example: "18:00"
 *     responses:
 *       200:
 *         description: Horas de trabalho definidas/atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Horas de trabalho definidas/atualizadas com sucesso.
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
  .post(workHourController.setWorkHours);

module.exports = router;
