const admin = require("../config/firebaseAdmin");
const { sendPushNotification } = require("../services/sendNotification");
const { User } = require("../models"); // ou ajuste para onde estiver seu model

// Enviar notificação push
exports.sendNotification = async (req, res) => {
  const { token, title, body } = req.body;

  try {
    await sendPushNotification(token, {
      title,
      body,
      icon: "/logo.png", // opcional
    });

    res.status(200).json({ success: true, message: "Notificação enviada!" });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({ success: false, message: "Erro ao enviar notificação", error });
  }
};

// Salvar token FCM do usuário
exports.saveNotificationToken = async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "userId e token são obrigatórios" });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    user.notificationToken = token;
    await user.save();

    res.status(200).json({ message: "Token salvo com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar token:", error);
    res.status(500).json({ error: "Erro ao salvar token" });
  }
};
