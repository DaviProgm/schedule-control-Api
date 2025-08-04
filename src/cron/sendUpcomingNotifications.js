const cron = require("node-cron");
const { Op } = require("sequelize");
const { Schedule, User } = require("../models"); // ✅ Corrigido
const { sendPushNotification } = require("../services/sendNotification");

cron.schedule("* * * * *", async () => {
  console.log("🔔 Verificando agendamentos próximos...");

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  try {
    const upcomingAppointments = await Schedule.findAll({
      where: {
        date: {
          [Op.between]: [now, oneHourLater],
        },
        notified: false,
      },
      include: [
        {
          model: User,
          attributes: ["notificationToken", "name"],
        },
      ],
    });

    for (const appointment of upcomingAppointments) {
      const user = appointment.User;

      if (user?.notificationToken) {
        try {
          await sendPushNotification(user.notificationToken, {
            title: "📅 Lembrete de Agendamento",
            body: `Olá ${user.name}, você tem um agendamento às ${new Date(
              appointment.date
            ).toLocaleTimeString("pt-BR")}.`,
            icon: "/logo.png",
          });

          appointment.notified = true;
          await appointment.save();
        } catch (pushError) {
          console.error("Erro ao enviar notificação:", pushError);
        }
      }
    }
  } catch (err) {
    console.error("Erro no cron job de notificações:", err);
  }
});
