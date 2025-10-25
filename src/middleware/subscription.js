const { Subscription } = require('../models');

async function checkActiveSubscription(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  try {
    // The user to check is the owner if it exists, otherwise it's the user themselves.
    const userIdToCheck = req.user.ownerId || req.user.id;

    const subscription = await Subscription.findOne({ where: { userId: userIdToCheck } });

    if (!subscription || subscription.status !== 'ativo') {
      return res.status(403).json({ 
        message: "Acesso negado. É necessário que o dono do negócio tenha uma assinatura ativa.",
        code: 'INACTIVE_SUBSCRIPTION'
      });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar assinatura ativa:", error);
    return res.status(500).json({ message: "Erro interno ao verificar a assinatura." });
  }
}

module.exports = checkActiveSubscription;
