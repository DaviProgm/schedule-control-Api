const { SupportTicket, User } = require('../models');
const transporter = require('../config/mailer');

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

    // Send email notification
    const mailOptions = {
      from: process.env.MAIL_USER, // sender address
      to: 'workgate.oficial@gmail.com', // list of receivers
      subject: `Novo Chamado de Suporte: ${subject}`,
      html: `
        <h1>Novo Chamado de Suporte Recebido</h1>
        <p><b>De:</b> ${user.name} (${user.email})</p>
        <p><b>Assunto:</b> ${subject}</p>
        <hr>
        <p><b>Mensagem:</b></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

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
