const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports');

/**
 * @swagger
 * /reports/weekly:
 *   get:
 *     summary: Retorna um relatório semanal
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório semanal retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAppointments:
 *                   type: number
 *                   example: 15
 *                 totalRevenue:
 *                   type: number
 *                   format: float
 *                   example: 1500.75
 *                 appointmentsByService:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       serviceName:
 *                         type: string
 *                         example: Corte de Cabelo
 *                       count:
 *                         type: number
 *                         example: 10
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/weekly', reportsController.getWeeklyReport);

module.exports = router;
