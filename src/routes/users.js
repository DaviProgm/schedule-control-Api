const express = require('express');
const router = express.Router();
const multer = require('multer');

const UserController = require('../controllers/users.js');
const middlewareUsers = require('../middleware/users.js');
const authMiddleware = require('../middleware/auth.js');
const { User } = require('../models/users.js');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra um novo dono de negócio
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nome do Dono
 *               email:
 *                 type: string
 *                 format: email
 *                 example: dono@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SenhaSegura123
 *     responses:
 *       201:
 *         description: Dono do negócio registrado com sucesso
 *       400:
 *         description: Erro na requisição
 */
router.post('/register',
  middlewareUsers.ValidateCreateUser,
  UserController.RegisterOwner
);

/**
 * @swagger
 * /users/professionals:
 *   post:
 *     summary: Registra um novo profissional para o dono do negócio logado
 *     tags: [Users]
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
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nome do Profissional
 *               email:
 *                 type: string
 *                 format: email
 *                 example: profissional@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SenhaSegura123
 *     responses:
 *       201:
 *         description: Profissional registrado com sucesso
 *       403:
 *         description: Não autorizado (apenas donos de negócio podem cadastrar)
 */
router.post('/professionals',
  authMiddleware,
  middlewareUsers.ValidateCreateUser,
  UserController.createProfessional
);

/**
 * @swagger
 * /users/professionals:
 *   get:
 *     summary: Retorna a lista de profissionais do dono do negócio logado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de profissionais retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/professionals',
  authMiddleware,
  UserController.getProfessionalsByOwner
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retorna uma lista de todos os usuários (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/',
  authMiddleware, // Should add an admin check middleware here later
  UserController.getAllUsers
);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Novo Nome
 *               email:
 *                 type: string
 *                 format: email
 *                 example: novo.email@example.com
 *               bio:
 *                 type: string
 *                 example: Minha nova biografia.
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.put('/profile',
  authMiddleware,
  UserController.updateProfile
);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário retornado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/profile',
  authMiddleware,
  UserController.getProfile
);

/**
 * @swagger
 * /users/profile/photo:
 *   post:
 *     summary: Faz upload da foto de perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo da imagem de perfil
 *     responses:
 *       200:
 *         description: Foto de perfil atualizada com sucesso
 *       400:
 *         description: Nenhuma imagem fornecida ou formato inválido
 *       401:
 *         description: Não autorizado
 */
router.post('/profile/photo', 
  authMiddleware, 
  upload.single('photo'), 
  UserController.uploadProfilePhoto
);

/**
 * @swagger
 * /users/{userId}/set-default-work-hours:
 *   post:
 *     summary: Define as horas de trabalho padrão para um usuário específico
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Horas de trabalho padrão definidas com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 */
router.post('/:userId/set-default-work-hours',
  authMiddleware,
  UserController.setDefaultWorkHours
);

/**
 * @swagger
 * /users/profile/professional-photo:
 *   post:
 *     summary: Faz upload da foto de profissional do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               professional_photo:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo da imagem de profissional
 *     responses:
 *       200:
 *         description: Foto de profissional atualizada com sucesso
 *       400:
 *         description: Nenhuma imagem fornecida ou formato inválido
 *       401:
 *         description: Não autorizado
 */
router.post('/profile/professional-photo',
  authMiddleware,
  upload.single('professional_photo'),
  UserController.uploadProfessionalPhoto
);

module.exports = router;
