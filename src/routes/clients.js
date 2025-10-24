const router = require('express').Router();
const express = require('express');
const multer = require('multer');

const ClientController = require('../controllers/clients');
const UpdateClient = require('../controllers/clients');
const {
  validateCreateClient,
  validateUpdateClient,
} = require('../middleware/clients');
const authMiddleware = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [Clients]
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
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nome do Cliente
 *               email:
 *                 type: string
 *                 format: email
 *                 example: cliente@example.com
 *               phone:
 *                 type: string
 *                 example: "+5511987654321"
 *               address:
 *                 type: string
 *                 example: Rua Exemplo, 123
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente criado com sucesso
 *                 client:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     name:
 *                       type: string
 *                       example: Nome do Cliente
 *                     email:
 *                       type: string
 *                       example: cliente@example.com
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dados do cliente inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/clientes',
    validateCreateClient,
    ClientController.CreateClient
);
/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Retorna uma lista de clientes
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
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
 *                     example: Nome do Cliente
 *                   email:
 *                     type: string
 *                     example: cliente@example.com
 *                   phone:
 *                     type: string
 *                     example: "+5511987654321"
 *                   address:
 *                     type: string
 *                     example: Rua Exemplo, 123
 *                   birthDate:
 *                     type: string
 *                     format: date
 *                     example: "1990-01-01"
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/clientes', ClientController.GetClients);
/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Atualiza um cliente existente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do cliente a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Novo Nome do Cliente
 *               email:
 *                 type: string
 *                 format: email
 *                 example: novo.email@example.com
 *               phone:
 *                 type: string
 *                 example: "+5511998877665"
 *               address:
 *                 type: string
 *                 example: Nova Rua, 456
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1995-05-05"
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente atualizado com sucesso
 *                 client:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     name:
 *                       type: string
 *                       example: Novo Nome do Cliente
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/clientes/:id',
    validateUpdateClient,
    ClientController.UpdateClient
);
/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Exclui um cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do cliente a ser excluído
 *     responses:
 *       200:
 *         description: Cliente excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/clientes/:id', ClientController.DeleteClient);

/**
 * @swagger
 * /clientes/{id}/foto-perfil:
 *   post:
 *     summary: Faz upload da foto de perfil de um cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do cliente
 *       - in: formData
 *         name: profile_picture
 *         type: file
 *         description: Arquivo da imagem de perfil
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto de perfil atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Foto de perfil atualizada com sucesso
 *                 imageUrl:
 *                   type: string
 *                   example: http://example.com/path/to/image.jpg
 *       400:
 *         description: Nenhuma imagem fornecida ou formato inválido
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/clientes/:id/foto-perfil', upload.single('profile_picture'), ClientController.UploadProfilePicture);

module.exports = router;