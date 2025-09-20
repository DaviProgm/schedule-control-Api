const cron = require('node-cron');
const { User } = require('../models');
const { sendDailyScheduleEmail } = require('../services/providerNotificationService');

// Roda todo dia às 8:00 da manhã
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily job: Send Provider Summaries');

  try {
    const users = await User.findAll();

    if (!users || users.length === 0) {
      console.log('No users found to send summaries to.');
      return;
    }

    // Dispara o envio para todos os usuários em paralelo
    const emailPromises = users.map(user => sendDailyScheduleEmail(user.id));
    await Promise.all(emailPromises);

    console.log(`Finished sending daily summaries to ${users.length} users.`);

  } catch (error) {
    console.error('Error running Send Provider Summaries cron job:', error);
  }
});
