const router = require('express').Router();
const express = require('express');


const ClientController = require('../controllers/clients');
const ClientMiddleware = require('../middleware/clients');
const authMiddleware = require('../middleware/auth');
const DeleteClient = require('../middleware/clients');
const UpdateClient = require('../controllers/clients');


router.use(authMiddleware);

router.post('/clientes',
    ClientMiddleware.validateCreateClient,
    ClientController.CreateClient
);
router.get('/clientes', ClientController.GetClients);
router.put('/clientes/:id',
    ClientMiddleware.validateUpdateClient,
    ClientController.UpdateClient
);
router.delete('/clientes/:id', ClientController.DeleteClient);

module.exports = router;