async function validateCreateClient(req, res, next) {
  const { name, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).send({
      message: "Os campos 'name' e 'email' são obrigatórios.",
    });
  }

  if (phone) {
    const phoneRegex = /^\d{10,11}$/; // aceita 10 ou 11 dígitos
    if (!phoneRegex.test(phone)) {
      return res.status(400).send({
        message: "Formato de telefone inválido. Deve conter 10 ou 11 dígitos numéricos.",
      });
    }
  }

  next();
}

function validateUpdateClient(req, res, next) {
  const { name, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).send({
      message: "Os campos 'name' e 'email' são obrigatórios.",
    });
  }

  if (phone) {
    const phoneRegex = /^\d{10,11}$/; // aceita 10 ou 11 dígitos
    if (!phoneRegex.test(phone)) {
      return res.status(400).send({
        message: "Formato de telefone inválido. Deve conter 10 ou 11 dígitos numéricos.",
      });
    }
  }

  next();
}

module.exports = {
  validateCreateClient,
  validateUpdateClient,
};
