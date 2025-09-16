const { Subscription } = require('../models');

async function checkActiveSubscription(req, res, next) {
  console.log(`--- Middleware de Assinatura Ativa executado para a rota: ${req.method} ${req.originalUrl} --`);
  try {
    const subscription = await Subscription.findOne({ where: { userId: req.user.id } });

    if (!subscription || subscription.status !== 'ativo') {
      return res.status(403).json({ 
        message: "Acesso negado. É necessário ter uma assinatura ativa para usar esta funcionalidade."
      });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar assinatura ativa:", error);
    return res.status(500).json({ message: "Erro interno ao verificar a assinatura." });
  }
}

module.exports = checkActiveSubscription;
