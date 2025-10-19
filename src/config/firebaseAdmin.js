const admin = require("firebase-admin");
require('dotenv').config(); // Garante que as variáveis do .env sejam carregadas

const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH;

if (!credentialsPath) {
  throw new Error('CRÍTICO: A variável de ambiente FIREBASE_CREDENTIALS_PATH não está definida. Por favor, aponte para o caminho absoluto do seu arquivo de credenciais do Firebase.');
}

let serviceAccount;
try {
  serviceAccount = require(credentialsPath);
} catch (e) {
  throw new Error(`Não foi possível carregar as credenciais do Firebase do caminho: ${credentialsPath}. Verifique se a variável FIREBASE_CREDENTIALS_PATH está correta.`);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;