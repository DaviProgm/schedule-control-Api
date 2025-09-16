const { User } = require('../models');

async function ValidateCreateUser(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      message: "Email e senha são obrigatórios.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send({
      message: "Formato de e-mail inválido.",
    });
  }

  if (password.length < 8) {
    return res.status(400).send({
      message: "A senha deve ter pelo menos 8 caracteres.",
    });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({
        message: "Usuário já existe.",
      });
    }

    next();
  } catch (error) {
    console.error("Erro ao validar criação de usuário:", error);
    return res.status(500).send({
      message: "Erro interno ao validar criação de usuário.",
      error: error.message,
    });
  }
}

module.exports = {
  ValidateCreateUser,
};
