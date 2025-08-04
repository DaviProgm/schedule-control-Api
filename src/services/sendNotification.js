const admin = require("../config/firebaseAdmin");

const sendPushNotification = async (fcmToken, notification) => {
  const message = {
    token: fcmToken,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    webpush: {
      notification: {
        icon: notification.icon || "/logo.png",
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notificação enviada:", response);
    return response;
  } catch (error) {
    console.error("❌ Erro ao enviar notificação:", error);
    throw error;
  }
};

module.exports = { sendPushNotification };
