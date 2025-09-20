const cron = require('node-cron');
const { Op } = require('sequelize');
const moment = require('moment');
const Schedule = require('../models/schedule');
const Client = require('../models/clients');
const { sendSms } = require('../services/sendWhatsapp');

// Roda no início de cada hora (minuto 0)
cron.schedule('0 * * * *', async () => {
  console.log('Running cron job: sendHourlyReminders (SMS)');

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
      console.log('No appointments in the next hour. No reminders to send.');
      return;
    }

    console.log(`Found ${schedules.length} appointments in the next hour. Sending reminders...`);

    for (const schedule of schedules) {
      const client = schedule.client;

      if (client && client.phone) {
        const formattedDate = moment(schedule.date).format('DD/MM/YYYY');
        const formattedTime = schedule.time;

        const messageBody = `Lembrete: seu agendamento de ${schedule.service} é hoje, dia ${formattedDate} às ${formattedTime}.`;

        await sendSms(
          client.phone,
          messageBody
        );
      }
    }
  } catch (error) {
    console.error('Error running sendHourlyReminders (SMS) cron job:', error);
  }
});
