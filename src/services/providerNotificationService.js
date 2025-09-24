const { User, Schedule, Client, Service } = require('../models');
const { sendEmail } = require('./sendWhatsapp'); // This file now sends emails
const moment = require('moment-timezone');

/**
 * Fetches all schedules for a given user for the current day and sends a summary email.
 * @param {number} userId The ID of the user (service provider).
 */
async function sendDailyScheduleEmail(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user || !user.email) {
      console.log(`User ${userId} not found or has no email. Skipping summary.`);
      return;
    }

    const timezone = "America/Sao_Paulo";
    const today = moment.tz(timezone).format('YYYY-MM-DD');

    const schedules = await Schedule.findAll({
      where: {
        userId: userId,
        date: today,
      },
      include: [
        { model: Client, as: 'client', attributes: ['name'] },
        { model: Service, as: 'service', attributes: ['name', 'duration'] },
      ],
      order: [['time', 'ASC']],
    });

    const subject = 'Sua Agenda para Hoje';
    let scheduleHtml = '<p style="font-size: 16px;">Você não tem agendamentos para hoje.</p>';

    if (schedules.length > 0) {
      scheduleHtml = '';
      for (const s of schedules) {
        scheduleHtml += `
          <div style="padding: 10px; border-bottom: 1px solid #eeeeee;">
            <p style="margin: 0; font-size: 16px; color: #333333;">
              <strong style="color: #6b0082;">${s.time}</strong> - ${s.service.name}
            </p>
            <p style="margin: 5px 0 0; font-size: 14px; color: #888888;">
              Cliente: ${s.client.name}
            </p>
          </div>
        `;
      }
    }

    const htmlBody = `
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #0b0b0d; color: #ffffff;">
                                <img src="https://i.ibb.co/4Zt4PpDZ/Design-sem-nome-3.png" alt="Workgate Logo" width="180" style="display: block; margin-bottom: 20px;"/>
                                <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Sua Agenda de Hoje</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 30px; color: #333333;">
                                <p style="font-size: 16px; margin: 0 0 20px;">Olá, ${user.name},</p>
                                <p style="font-size: 16px; line-height: 1.5;">
                                    Aqui está um resumo dos seus compromissos para hoje, ${moment.tz(timezone).format('DD/MM/YYYY')}:
                                </p>
                                <div style="margin: 30px 0; border: 1px solid #eeeeee; border-radius: 5px; overflow: hidden;">
                                    ${scheduleHtml}
                                </div>
                                <p style="font-size: 16px;">Tenha um ótimo dia!</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px; font-size: 12px; color: #888888; background-color: #f4f4f4;">
                                <p style="margin: 0;">Este é um e-mail automático.</p>
                                <p style="margin: 5px 0 0;">© 2025 Workgate</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    `;

    await sendEmail(user.email, subject, htmlBody);

  } catch (error) {
    console.error(`Failed to send daily schedule email to user ${userId}:`, error);
  }
}

module.exports = {
  sendDailyScheduleEmail,
};