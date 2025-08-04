// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const { sendNotification, saveNotificationToken } = require("../controllers/notificationController");

router.post("/send-notification", sendNotification);
router.post("/token", saveNotificationToken); // ✅ nova rota para salvar token

module.exports = router;
