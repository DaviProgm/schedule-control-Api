const cron = require('node-cron');
const { Op } = require('sequelize');
const moment = require('moment');
const Schedule = require('../models/schedule');
const Client = require('../models/clients');
const { sendEmail } = require('../services/sendWhatsapp');

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
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
                            <tr>
                                <td align="center" style="padding: 30px 20px; background-color: #0b0b0d; color: #ffffff;">
                                    <img src="https://i.ibb.co/svh74hCH/Whats-App-Image-2025-09-18-at-01-23-19-removebg-preview.png" alt="Workgate Logo" width="180" style="display: block; margin-bottom: 20px;"/>
                                    <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Lembrete de Agendamento</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px; color: #333333;">
                                    <p style="font-size: 16px; margin: 0 0 20px;">Olá, ${client.name},</p>
                                    <p style="font-size: 16px; line-height: 1.5;">
                                        Este é um lembrete para o seu agendamento de <strong>${schedule.service}</strong> que acontecerá em breve.
                                    </p>
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center" style="padding: 20px; background-color: #f9f9f9; border: 1px solid #eeeeee; border-radius: 5px;">
                                                <p style="font-size: 18px; margin: 0; color: #333333;">
                                                    <strong>Data:</strong> ${formattedDate}<br>
                                                    <strong>Hora:</strong> ${formattedTime}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="font-size: 16px;">Estamos te esperando!</p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 20px; font-size: 12px; color: #888888; background-color: #f4f4f4;">
                                    <p style="margin: 0;">Este é um e-mail automático, por favor não responda.</p>
                                    <p style="margin: 5px 0 0;">© 2025 Workgate</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
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
