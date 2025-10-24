const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.js');
 console.log('PublicRouter loaded and running!');
// Route to get a provider's public profile (services, work hours, etc.)
/**
 * @swagger
 * /public/provider/{username}:
 *   get:
 *     summary: Retorna o perfil público de um provedor
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome de usuário do provedor
 *     responses:
 *       200:
 *         description: Perfil público do provedor retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 username:
 *                   type: string
 *                   example: provedor_exemplo
 *                 name:
 *                   type: string
 *                   example: Nome do Provedor
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                 workHours:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       dayOfWeek:
 *                         type: number
 *                       startTime:
 *                         type: string
 *                       endTime:
 *                         type: string
 *       404:
 *         description: Provedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/provider/:username', publicController.getPublicProfile);
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 name:
 *                   type: string
 *                   example: Nome do Cliente
 *                 email:
 *                   type: string
 *                   example: cliente@example.com
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/client/:id', publicController.getPublicClientProfile);

// Route to get availability for a provider by username
/**
 * @swagger
 * /public/availability/{username}:
 *   get:
 *     summary: Retorna a disponibilidade de um provedor por nome de usuário
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
 *         description: Disponibilidade do provedor retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 availableSlots:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-27T09:00:00Z"
 *       404:
 *         description: Provedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/availability/:username', publicController.getAvailability);

// Route to create a new schedule from the public page
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
 *               - providerUsername
 *               - clientName
 *               - clientEmail
 *               - clientPhone
 *               - serviceId
 *               - startTime
 *               - endTime
 *             properties:
 *               providerUsername:
 *                 type: string
 *                 example: provedor_exemplo
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
 *               serviceId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-27T10:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-27T11:00:00Z"
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
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     providerUsername:
 *                       type: string
 *                       example: provedor_exemplo
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 debugInfo:
 *                   type: string
 *                   example: "Informações de depuração da disponibilidade."
 *       404:
 *         description: Provedor não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/debug/availability/:username', publicController.debugAvailability);

module.exports = router;
