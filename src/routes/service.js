const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service');
const authMiddleware = require('../middleware/auth');

// All service routes are protected
router.use(authMiddleware);

// Routes for /services
/**
 * @swagger
 * /services:
 *   get:
 *     summary: Retorna uma lista de serviços
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de serviços retornada com sucesso
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
 *                   name:
 *                     type: string
 *                     example: Corte de Cabelo
 *                   description:
 *                     type: string
 *                     example: Corte de cabelo masculino ou feminino
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 50.00
 *                   duration:
 *                     type: number
 *                     example: 30
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.route('/')
  .get(serviceController.getAllServices)
/**
 * @swagger
 * /services:
 *   post:
 *     summary: Cria um novo serviço
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
 *             properties:
 *               name:
 *                 type: string
 *                 example: Corte de Cabelo
 *               description:
 *                 type: string
 *                 example: Corte de cabelo masculino ou feminino
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 50.00
 *               duration:
 *                 type: number
 *                 example: 30
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Serviço criado com sucesso
 *                 service:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     name:
 *                       type: string
 *                       example: Corte de Cabelo
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
  .post(serviceController.createService);

// Routes for /services/:id
/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Retorna um serviço pelo ID
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do serviço
 *     responses:
 *       200:
 *         description: Serviço retornado com sucesso
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
 *                   example: Corte de Cabelo
 *                 description:
 *                   type: string
 *                   example: Corte de cabelo masculino ou feminino
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 50.00
 *                 duration:
 *                   type: number
 *                   example: 30
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Serviço não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.route('/:id')
  .get(serviceController.getServiceById)
/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Atualiza um serviço existente
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do serviço a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Novo Nome do Serviço
 *               description:
 *                 type: string
 *                 example: Nova descrição do serviço
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 60.00
 *               duration:
 *                 type: number
 *                 example: 45
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Serviço atualizado com sucesso
 *                 service:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     name:
 *                       type: string
 *                       example: Novo Nome do Serviço
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Serviço não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
  .put(serviceController.updateService)
/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Exclui um serviço
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do serviço a ser excluído
 *     responses:
 *       200:
 *         description: Serviço excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Serviço excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Serviço não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
  .delete(serviceController.deleteService);

module.exports = router;
