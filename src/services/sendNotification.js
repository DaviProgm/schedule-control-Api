const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.resolve(__dirname, "../../cloktrix-firebase-adminsdk-fbsvc-8b8a09a465.json"));

// Verifica se já existe uma instância do app
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

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
