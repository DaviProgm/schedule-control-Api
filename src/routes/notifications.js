const express = require('express');
const router = express.Router();

const  enviarNotificacao  = require('../controllers/notification');

router.post('/notificar', enviarNotificacao.enviarNotificacao);

module.exports = router;
