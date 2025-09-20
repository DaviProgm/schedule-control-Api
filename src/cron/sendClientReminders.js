const cron = require('node-cron');
const { Op } = require('sequelize');
const moment = require('moment');
const Schedule = require('../models/schedule');
const Client = require('../models/clients');
const { sendSms } = require('../services/sendWhatsapp'); // File name is the same, but logic is now SMS

// Schedule to run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running cron job: sendClientReminders (SMS)');

  const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

  try {
    const schedules = await Schedule.findAll({
      where: {
        date: tomorrow,
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
      console.log('No appointments for tomorrow. No SMS reminders to send.');
      return;
    }

    console.log(`Found ${schedules.length} appointments for tomorrow. Sending SMS reminders...`);

    for (const schedule of schedules) {
      const client = schedule.client;

      if (client && client.phone) {
        // Format date and time
        const formattedDate = moment(schedule.date).format('DD/MM/YYYY');
        const formattedTime = schedule.time;

        // Construct the message body
        const messageBody = `Olá ${client.name}, este é um lembrete do seu agendamento de ${schedule.service} amanhã, dia ${formattedDate} às ${formattedTime}.`;

        await sendSms(
          client.phone,
          messageBody
        );
      }
    }
  } catch (error) {
    console.error('Error running sendClientReminders (SMS) cron job:', error);
  }
});