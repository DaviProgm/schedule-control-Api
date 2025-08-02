const path = require("path");
const serviceAccount = require(path.resolve(__dirname, "../../cloktrix-firebase-adminsdk-fbsvc-8b8a09a465.json"));

const admin = require("firebase-admin");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;