require('dotenv').config();
console.log('MAIL_HOST:', process.env.MAIL_HOST);
const express = require('express');
const sequelize = require('./src/config/database');
const app = express();
const port = 4005;
const cors = require('cors');
const notificationRoutes = require('./src/routes/notifications');

const UserRouter = require('./src/routes/users');
const AuthRouter = require('./src/routes/auth')
const scheduleRoutes = require('./src/routes/schedule');
const ClientRouter = require('./src/routes/clients');
const SubscriptionRouter = require('./src/routes/subscription');
const WebhookRouter = require('./src/routes/webhook');
const SupportTicketRouter = require('./src/routes/supportTicket');
const ReportsRouter = require('./src/routes/reports');
const ServiceRouter = require('./src/routes/service');
const WorkHourRouter = require('./src/routes/workHour');
const PublicRouter = require('./src/routes/public');
const authMiddleware = require('./src/middleware/auth');
const checkActiveSubscription = require('./src/middleware/subscription');
require("./src/cron/sendUpcomingNotifications");
require("./src/cron/sendHourlyReminders");
require("./src/cron/sendProviderSummary");

app.use(cors({
  origin: '*'
}));

app.use(express.json());
app.use(express.static('public'));
app.use((req, res, next) => {
  console.log(`REQ: ${req.method} ${req.url}`);
  next();
});
//
app.use('/users', UserRouter);
app.use('/auth', AuthRouter)
app.use('/agendamentos', authMiddleware, checkActiveSubscription, scheduleRoutes);
app.use(ClientRouter);
app.use(SubscriptionRouter);
app.use(WebhookRouter);
app.use(notificationRoutes);
app.use('/support-tickets', authMiddleware, SupportTicketRouter);
app.use('/reports', authMiddleware, checkActiveSubscription, ReportsRouter);
app.use('/services', ServiceRouter);
app.use('/work-hours', WorkHourRouter);
app.use('/public', PublicRouter);

sequelize.sync({ alter: true }).then(() => {
  console.log('Banco de dados sincronizado');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
