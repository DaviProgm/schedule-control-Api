const { SupportTicket } = require('../models');

async function createSupportTicket(req, res) {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Assunto e mensagem são obrigatórios.' });
    }

    const ticket = await SupportTicket.create({
      subject,
      message,
      userId,
    });

    return res.status(201).json({
      message: 'Chamado de suporte criado com sucesso!',
      ticket,
    });
  } catch (error) {
    console.error("Erro ao criar chamado de suporte:", error);
    return res.status(500).json({
      message: 'Erro ao criar chamado de suporte.',
      error: error.message,
    });
  }
}

module.exports = {
  createSupportTicket,
};
