const router = require('express').Router();
const express = require('express');


const ClientController = require('../controllers/clients');
const UpdateClient = require('../controllers/clients');
const {
  validateCreateClient,
  validateUpdateClient,
} = require('../middleware/clients');
const authMiddleware = require('../middleware/auth');

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

module.exports = router;