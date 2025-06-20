require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function enviarMensagem(numeroDestino, texto) {
  return client.messages.create({
    body: texto,
    from: 'whatsapp:+14155238886',  // seu número sandbox do .env ou fixo
    to: numeroDestino,
  });
}

module.exports = { enviarMensagem };
