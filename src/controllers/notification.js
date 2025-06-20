const { Notification } = require('../models/notifications');
const { enviarMensagem } = require('../utils/twilio');

async function enviarNotificacao(req, res) {
  const { userId, numeroUsuario, texto } = req.body;
  try {
    console.log(`[Notificação] Iniciando envio para: ${numeroUsuario} - texto: "${texto}"`);

    const message = await enviarMensagem(numeroUsuario, texto);

    console.log(`[Notificação] Mensagem enviada, SID: ${message.sid}`);

    await Notification.create({
      userId,
      phoneNumber: numeroUsuario,
      message: texto,
      status: 'enviado',
      sentAt: new Date(),
    });

    console.log(`[Notificação] Notificação salva no banco`);

    res.status(200).json({ message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    console.error('[Notificação] Erro ao enviar mensagem via Twilio:', error);

    try {
      await Notification.create({
        userId,
        phoneNumber: numeroUsuario,
        message: texto,
        status: 'falhou',
        sentAt: new Date(),
      });
      console.log('[Notificação] Notificação de falha salva no banco');
    } catch(dbError) {
      console.error('[Notificação] Erro ao salvar notificação de falha:', dbError);
    }

    res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
  }
}

module.exports = {
  enviarNotificacao
};
