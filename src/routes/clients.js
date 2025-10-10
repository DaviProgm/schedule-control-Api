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

router.post('/clientes',
    validateCreateClient,
    ClientController.CreateClient
);
router.get('/clientes', ClientController.GetClients);
router.put('/clientes/:id',
    validateUpdateClient,
    ClientController.UpdateClient
);
router.delete('/clientes/:id', ClientController.DeleteClient);

router.post('/clientes/:id/foto-perfil', upload.single('profile_picture'), ClientController.UploadProfilePicture);

module.exports = router;