const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const authMiddleware = require('../middleware/auth');

// All unit routes are protected
router.use(authMiddleware);

/**
 * @swagger
 * /units:
 *   get:
 *     summary: Retorna uma lista de unidades do dono do negócio
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de unidades retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/', unitController.getAllUnits);

/**
 * @swagger
 * /units:
 *   post:
 *     summary: Cria uma nova unidade para o dono do negócio
 *     tags: [Units]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Unidade Leste
 *               address:
 *                 type: string
 *                 example: Avenida Secundária, 200
 *               phone:
 *                 type: string
 *                 example: "+5511998877665"
 *     responses:
 *       201:
 *         description: Unidade criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/', unitController.createUnit);

/**
 * @swagger
 * /units/{id}:
 *   get:
 *     summary: Retorna uma unidade pelo ID
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Unidade retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Unidade não encontrada
 */
router.get('/:id', unitController.getUnitById);

/**
 * @swagger
 * /units/{id}:
 *   put:
 *     summary: Atualiza uma unidade existente
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID da unidade a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Unidade Oeste
 *               address:
 *                 type: string
 *                 example: Rua Nova, 300
 *               phone:
 *                 type: string
 *                 example: "+5511977665544"
 *     responses:
 *       200:
 *         description: Unidade atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Unidade não encontrada
 */
router.put('/:id', unitController.updateUnit);

/**
 * @swagger
 * /units/{id}:
 *   delete:
 *     summary: Exclui uma unidade
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID da unidade a ser excluída
 *     responses:
 *       204:
 *         description: Unidade excluída com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Unidade não encontrada
 */
router.delete('/:id', unitController.deleteUnit);


// Routes for associating/disassociating providers and services
/**
 * @swagger
 * /units/{unitId}/providers/{userId}:
 *   post:
 *     summary: Associa um provedor a uma unidade
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID da unidade
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do provedor (usuário)
 *     responses:
 *       200:
 *         description: Provedor associado à unidade com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Unidade ou Provedor não encontrado
 */
router.post('/:unitId/providers/:userId', unitController.addProviderToUnit);

/**
 * @swagger
 * /units/{unitId}/providers/{userId}:
 *   delete:
 *     summary: Desassocia um provedor de uma unidade
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID da unidade
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do provedor (usuário)
 *     responses:
 *       200:
 *         description: Provedor desassociado da unidade com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Unidade ou Provedor não encontrado
 */
router.delete('/:unitId/providers/:userId', unitController.removeProviderFromUnit);

/**
 * @swagger
 * /units/{unitId}/services/{serviceId}:
 *   post:
 *     summary: Associa um serviço a uma unidade
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID da unidade
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do serviço
 *     responses:
 *       200:
 *         description: Serviço associado à unidade com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Unidade ou Serviço não encontrado
 */
router.post('/:unitId/services/:serviceId', unitController.addServiceToUnit);

/**
 * @swagger
 * /units/{unitId}/services/{serviceId}:
 *   delete:
 *     summary: Desassocia um serviço de uma unidade
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID da unidade
 *       - in: path
 *         name: serviceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do serviço
 *     responses:
 *       200:
 *         description: Serviço desassociado da unidade com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Unidade ou Serviço não encontrado
 */
router.delete('/:unitId/services/:serviceId', unitController.removeServiceFromUnit);


module.exports = router;
