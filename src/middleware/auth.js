// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não informado' });
    }

    // Header tem o formato: "Bearer token" 
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = user; // disponibiliza o usuário para o próximo middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado!' });
  }
}

module.exports = authMiddleware;
