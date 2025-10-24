const express = require('express');
const router = express.Router();

const ScheduleController = require("../controllers/schedule");
const ScheduleMiddleware = require("../middleware/schedule");

/**
 * @swagger
 * /agendamentos:
 *   post:
 *     summary: Cria um novo agendamento
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - providerId
 *               - clientId
 *               - serviceId
 *               - startTime
 *               - endTime
 *             properties:
 *               providerId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               clientId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174001
 *               serviceId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174002
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-27T10:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-27T11:00:00Z"
 *               notes:
 *                 type: string
 *                 example: "Observações sobre o agendamento"
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Agendamento criado com sucesso
 *                 schedule:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174003
 *       400:
 *         description: Dados inválidos ou agendamento já existe
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  '/',
  ScheduleMiddleware.ValidadeCreateSchedule,
  ScheduleMiddleware.CheckScheduleExists,
  ScheduleController.CreateSchedule
);

/**
 * @swagger
 * /agendamentos:
 *   get:
 *     summary: Retorna uma lista de agendamentos
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos retornada com sucesso
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
 *                   providerId:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174001
 *                   clientId:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174002
 *                   serviceId:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174003
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-27T10:00:00Z"
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-27T11:00:00Z"
 *                   status:
 *                     type: string
 *                     example: "pending"
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', ScheduleController.GetSchedules);

/**
 * @swagger
 * /agendamentos/cliente/{id}:
 *   get:
 *     summary: Retorna agendamentos de um cliente específico
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Agendamentos do cliente retornados com sucesso
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
 *                   clientId:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174001
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-27T10:00:00Z"
 *                   status:
 *                     type: string
 *                     example: "pending"
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/cliente/:id', ScheduleController.GetSchedulesByClient);

/**
 * @swagger
 * /agendamentos/provedor/{id}:
 *   get:
 *     summary: Retorna agendamentos de um provedor específico
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do provedor
 *     responses:
 *       200:
 *         description: Agendamentos do provedor retornados com sucesso
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
 *                   providerId:
 *                     type: string
 *                     example: 123e4567-e89b-12d3-a456-426614174001
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-27T10:00:00Z"
 *                   status:
 *                     type: string
 *                     example: "pending"
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Provedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/provedor/:id', ScheduleController.getSchedulesByProvider);


/**
 * @swagger
 * /agendamentos/{id}:
 *   put:
 *     summary: Atualiza um agendamento existente
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agendamento a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               clientId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174001
 *               serviceId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174002
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-27T10:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-27T11:00:00Z"
 *               notes:
 *                 type: string
 *                 example: "Novas observações sobre o agendamento"
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Agendamento atualizado com sucesso
 *                 schedule:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174003
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/:id",
  ScheduleMiddleware.ValidadeCreateSchedule,
  ScheduleController.UpdateSchedule
);

/**
 * @swagger
 * /agendamentos/{id}:
 *   delete:
 *     summary: Exclui um agendamento
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agendamento a ser excluído
 *     responses:
 *       200:
 *         description: Agendamento excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Agendamento excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', ScheduleController.DeleteSchedules);

/**
 * @swagger
 * /agendamentos/{id}/status:
 *   put:
 *     summary: Atualiza o status de um agendamento
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agendamento a ter o status atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Status do agendamento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status do agendamento atualizado com sucesso
 *                 schedule:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174003
 *                     status:
 *                       type: string
 *                       example: confirmed
 *       400:
 *         description: Status inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Agendamento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id/status', ScheduleController.UpdateScheduleStatus);
module.exports = router;
