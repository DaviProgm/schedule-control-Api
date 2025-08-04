const cron = require("node-cron");
const db = require("../models");
const { sendPushNotification } = require("../services/sendNotification");
const { Op } = require("sequelize");

cron.schedule("* * * * *", async () => {
  console.log("[CRON] Verificando agendamentos para notificação...");

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  try {
    const appointments = await db.Appointment.findAll({
      where: {
        date: {
          [Op.between]: [now, oneHourLater],
        },
        notified: false,
      },
      include: [{ model: db.User, as: "user" }],
    });

    for (const appointment of appointments) {
      const token = appointment.user?.notificationToken;
      if (!token) continue;

      try {
        await sendPushNotification(token, {
          title: "Lembrete de Agendamento",
          body: `Você tem um agendamento às ${appointment.date.toLocaleTimeString()}`,
        });

        appointment.notified = true;
        await appointment.save();
        console.log(`[CRON] Notificação enviada para usuário ${appointment.user.id}`);
      } catch (err) {
        console.error(`[CRON] Erro ao enviar notificação:`, err);
      }
    }
  } catch (error) {
    console.error("[CRON] Erro ao buscar agendamentos:", error);
  }
});
