const cron = require("node-cron");
const admin = require("../config/firebaseAdmin");
const { sendPushNotification } = require("../services/sendNotification");
const db = require("../models"); // Sequelize ou conexão com seu banco

// Executa a cada minuto
cron.schedule("* * * * *", async () => {
  console.log("Verificando agendamentos...");

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // +1 hora

  try {
    const appointments = await db.Appointment.findAll({
      where: {
        date: {
          [db.Sequelize.Op.between]: [now, oneHourLater],
        },
      },
      include: [
        {
          model: db.User,
          attributes: ["notificationToken"],
        },
      ],
    });

    for (const appointment of appointments) {
      const token = appointment.User?.notificationToken;

      if (token) {
        await sendPushNotification(token, {
          title: "Lembrete de agendamento",
          body: `Você tem um agendamento às ${new Date(appointment.date).toLocaleTimeString()}.`,
        });
      }
    }
  } catch (err) {
    console.error("Erro ao enviar notificações:", err);
  }
});
