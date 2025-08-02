const admin = require("../config/firebaseAdmin");
const { sendPushNotification } = require("../services/sendNotification");


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
    res.status(500).json({ success: false, message: "Erro ao enviar notificação", error });
  }
};
