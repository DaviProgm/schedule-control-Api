require('dotenv').config();

function asaasAuth(req, res, next) {
  const token = req.headers['asaas-access-token'];
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

  if (!token || token !== expectedToken) {
    return res.status(401).send('Acesso não autorizado.');
  }

  next();
}

module.exports = asaasAuth;
