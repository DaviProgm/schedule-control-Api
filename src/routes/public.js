const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.js');
 console.log('PublicRouter loaded and running!');

/**
 * @swagger
 * /public/business/{username}:
 *   get:
 *     summary: Retorna o perfil público de um negócio (dono, profissionais e unidades)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome de usuário do dono do negócio
 *     responses:
 *       200:
 *         description: Perfil público do negócio retornado com sucesso
 *       404:
 *         description: Negócio não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/business/:username', publicController.getPublicProfile);

/**
 * @swagger
 * /public/client/{id}:
 *   get:
 *     summary: Retorna o perfil público de um cliente
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Perfil público do cliente retornado com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/client/:id', publicController.getPublicClientProfile);

/**
 * @swagger
 * /public/availability/{username}:
 *   get:
 *     summary: Retorna a disponibilidade de um profissional específico de um negócio
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome de usuário do dono do negócio
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do profissional para verificar a disponibilidade
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do serviço desejado
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Data para verificar a disponibilidade (YYYY-MM-DD)
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: ID da unidade para filtrar a disponibilidade
 *     responses:
 *       200:
 *         description: Disponibilidade do profissional retornada com sucesso
 *       404:
 *         description: Negócio ou profissional não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/availability/:username', publicController.getAvailability);

/**
 * @swagger
 * /public/schedules:
 *   post:
 *     summary: Cria um novo agendamento a partir da página pública
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - professionalId
 *               - serviceId
 *               - date
 *               - time
 *               - clientName
 *               - clientEmail
 *             properties:
 *               professionalId:
 *                 type: string
 *                 description: ID do profissional selecionado para o agendamento.
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               serviceId:
 *                 type: string
 *                 description: ID do serviço selecionado.
 *                 example: "123e4567-e89b-12d3-a456-426614174002"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Data do agendamento (YYYY-MM-DD).
 *                 example: "2025-10-27"
 *               time:
 *                 type: string
 *                 format: time
 *                 description: Hora do agendamento (HH:MM).
 *                 example: "10:00"
 *               clientName:
 *                 type: string
 *                 example: Cliente Público
 *               clientEmail:
 *                 type: string
 *                 format: email
 *                 example: cliente.publico@example.com
 *               clientPhone:
 *                 type: string
 *                 example: "+5511987654321"
 *               unitId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da unidade onde o agendamento será realizado (opcional).
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso
 *       400:
 *         description: Dados inválidos ou horário indisponível
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/schedules', publicController.createPublicSchedule);

// Temporary debug route
/**
 * @swagger
 * /public/debug/availability/{username}:
 *   get:
 *     summary: Rota de depuração para verificar a disponibilidade de um provedor
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome de usuário do provedor
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Data para verificar a disponibilidade (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Disponibilidade de depuração retornada com sucesso
 *       404:
 *         description: Provedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/debug/availability/:username', publicController.debugAvailability);

module.exports = router;

