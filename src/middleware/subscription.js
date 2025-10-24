const { Subscription } = require('../models');

async function checkActiveSubscription(req, res, next) {
  console.log(`\n[DEBUG] --- Middleware de Assinatura Ativa ---`);
  console.log(`[DEBUG] Rota: ${req.method} ${req.originalUrl}`);
  
  if (!req.user || !req.user.id) {
    console.log(`[DEBUG] ERRO: req.user.id não encontrado. O middleware de autenticação rodou antes?`);
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  console.log(`[DEBUG] Verificando assinatura para o userId: ${req.user.id}`);

  try {
    const subscription = await Subscription.findOne({ where: { userId: req.user.id } });

    if (!subscription) {
      console.log(`[DEBUG] Nenhuma assinatura encontrada para o userId: ${req.user.id}`);
      return res.status(403).json({ 
        message: "Nenhuma assinatura encontrada. Por favor, realize a inscrição."
      });
    }

    // Log do objeto de assinatura completo
    console.log(`[DEBUG] Assinatura encontrada:`, JSON.stringify(subscription, null, 2));

    if (subscription.status !== 'ativo') {
      console.log(`[DEBUG] Acesso negado. Status da assinatura é '${subscription.status}', mas era esperado 'ativo'.`);
      return res.status(403).json({ 
        message: `Acesso negado. Status da sua assinatura é '${subscription.status}'. É necessário ter uma assinatura ativa.`
      });
    }

    console.log(`[DEBUG] Acesso permitido. Status da assinatura é 'ativo'.`);
    next();
  } catch (error) {
    console.error("[DEBUG] Erro catastrófico ao verificar assinatura ativa:", error);
    return res.status(500).json({ message: "Erro interno ao verificar a assinatura." });
  }
}

module.exports = checkActiveSubscription;
