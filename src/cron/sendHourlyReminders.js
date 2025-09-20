const cron = require('node-cron');
const { Op } = require('sequelize');
const moment = require('moment');
const Schedule = require('../models/schedule');
const Client = require('../models/clients');
const { sendEmail } = require('../services/sendWhatsapp'); // File name is the same, but logic is now email

// Roda no início de cada hora (minuto 0)
cron.schedule('0 * * * *', async () => {
  console.log('Running cron job: sendHourlyReminders (Email)');

  const now = moment();
  const oneHourFromNow = moment().add(1, 'hour');

  try {
    const schedules = await Schedule.findAll({
      where: {
        date: now.format('YYYY-MM-DD'), // Agendamentos para hoje
        time: {
          [Op.between]: [now.format('HH:mm:ss'), oneHourFromNow.format('HH:mm:ss')],
        },
      },
      include: [
        {
          model: Client,
          as: 'client',
          required: true,
        },
      ],
    });

    if (schedules.length === 0) {
      console.log('No appointments in the next hour. No email reminders to send.');
      return;
    }

    console.log(`Found ${schedules.length} appointments in the next hour. Sending email reminders...`);

    for (const schedule of schedules) {
      const client = schedule.client;

      if (client && client.email) {
        const formattedDate = moment(schedule.date).format('DD/MM/YYYY');
        const formattedTime = schedule.time;

        const subject = `Lembrete de Agendamento: ${schedule.service}`;
        const htmlBody = `
            <h1>Lembrete de Agendamento</h1>
            <p>Olá, ${client.name}.</p>
            <p>Este é um lembrete para o seu agendamento de <strong>${schedule.service}</strong>, que acontecerá hoje, dia <strong>${formattedDate}</strong> às <strong>${formattedTime}</strong>.</p>
            <p>Até breve!</p>
        `;

        await sendEmail(
          client.email,
          subject,
          htmlBody
        );
      }
    }
  } catch (error) {
    console.error('Error running sendHourlyReminders (Email) cron job:', error);
  }
});