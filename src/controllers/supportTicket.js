const { SupportTicket, User } = require('../models');

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

    const user = await User.findByPk(userId);

    // Construct WhatsApp URL
    const whatsappNumber = '85921688734';
    const whatsappMessage = `Assunto: ${subject}\n\nMensagem: ${message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    return res.status(201).json({
      message: 'Chamado de suporte criado com sucesso! Redirecionando para o WhatsApp.',
      whatsappUrl,
      ticket,
    });
  } catch (error) {
    console.error("Erro ao criar chamado de suporte:", error);
    if (error.response) {
      console.error(error.response.body)
    }
    return res.status(500).json({
      message: 'Erro ao criar chamado de suporte.',
      error: error.message,
    });
  }
}

module.exports = {
  createSupportTicket,
};