require('dotenv').config();

function asaasAuth(req, res, next) {
  const receivedToken = req.headers['asaas-access-token'];
  
  // Limpa o token esperado: remove espaços e aspas
  let expectedToken = process.env.ASAAS_WEBHOOK_TOKEN || '';
  expectedToken = expectedToken.trim().replace(/^"|"$/g, '');

  if (!receivedToken || receivedToken !== expectedToken) {
    console.error(
      "Falha na autenticação do webhook Asaas.",
      "Token recebido:", receivedToken,
      "Token esperado:", expectedToken
    );
    return res.status(401).send('Acesso não autorizado.');
  }

  next();
}

module.exports = asaasAuth;