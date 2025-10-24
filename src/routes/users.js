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
 *     summary: Registra um novo usuário
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
 *                 example: Nome do Usuário
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SenhaSegura123
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário registrado com sucesso
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     name:s
 *                       type: string
 *                       example: Nome do Usuário
 *                     email:
 *                       type: string
 *                       example: usuario@example.com
 *       400:s
 *         description: Erro na requisição
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email já cadastrado ou dados inválidos
 */
router.post('/register',
  middlewareUsers.ValidateCreateUser,
  UserController.CreateUser
);
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retorna uma lista de usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
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
 *                     example: Nome do Usuário
 *                   email:
 *                     type: string
 *                     example: usuario@example.com
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/',
  UserController.GetUsers
)

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Perfil atualizado com sucesso
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     name:
 *                       type: string
 *                       example: Novo Nome
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
// Route to update the user's own profile (bio, username, etc.)
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
 *                   example: Nome do Usuário
 *                 email:
 *                   type: string
 *                   example: usuario@example.com
 *                 bio:
 *                   type: string
 *                   example: Minha biografia.
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
// Route to get the user's own profile
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
 *       500:
 *         description: Erro interno do servidor
 */
// Route to upload a profile photo
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *             properties:
 *               dayOfWeek:
 *                 type: number
 *                 description: Dia da semana (0 para Domingo, 1 para Segunda, etc.)
 *                 example: 1
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 format: time
 *                 example: "18:00"
 *     responses:
 *       200:
 *         description: Horas de trabalho padrão definidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Horas de trabalho padrão definidas com sucesso.
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
// Route to set default work hours for a specific user
router.post('/:userId/set-default-work-hours',
  authMiddleware,
  UserController.setDefaultWorkHours
);

module.exports = router;