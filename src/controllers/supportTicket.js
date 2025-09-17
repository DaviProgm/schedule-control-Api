const { SupportTicket, User } = require('../models');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // Send email notification with SendGrid
    const msg = {
      to: 'workgate.oficial@gmail.com', // Change to your recipient
      from: process.env.SENDGRID_FROM_EMAIL, // Change to your verified sender
      subject: `Novo Chamado de Suporte: ${subject}`,
      html: `
        <h1>Novo Chamado de Suporte Recebido</h1>
        <p><b>De:</b> ${user.name} (${user.email})</p>
        <p><b>Assunto:</b> ${subject}</p>
        <hr>
        <p><b>Mensagem:</b></p>
        <p>${message}</p>
      `,
    };

    await sgMail.send(msg);

    return res.status(201).json({
      message: 'Chamado de suporte criado com sucesso!',
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
