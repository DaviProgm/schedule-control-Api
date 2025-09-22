const cron = require('node-cron');
const axios = require('axios');

// Roda a cada 10 minutos para manter a API "acordada"
cron.schedule('*/10 * * * *', async () => {
  const APP_URL = process.env.RENDER_EXTERNAL_URL;

  if (!APP_URL) {
    console.log('[Keep-Alive] A variável de ambiente RENDER_EXTERNAL_URL não está definida. Pulando a requisição.');
    return;
  }

  try {
    // Adicionamos uma rota de "health check" que será o alvo do nosso ping
    const response = await axios.get(`${APP_URL}/health`);
    console.log(`[Keep-Alive] Ping enviado com sucesso para ${APP_URL}/health. Status: ${response.status}`);
  } catch (error) {
    console.error(`[Keep-Alive] Falha ao enviar ping para ${APP_URL}/health:`, error.message);
  }
});
