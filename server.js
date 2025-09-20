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
const authMiddleware = require('./src/middleware/auth');
const checkActiveSubscription = require('./src/middleware/subscription');
require("./src/cron/sendUpcomingNotifications");
require("./src/cron/sendHourlyReminders");
require("./src/cron/sendProviderSummary");

app.use(cors({
  origin: '*'
}));

app.use(express.json());
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

const startServer = async () => {
  try {
    const { Service, Schedule } = require('./src/models');
    console.log('Iniciando sincronização ordenada do banco de dados...');

    // Garante que a tabela Service exista primeiro
    await Service.sync({ alter: true });
    console.log('Tabela de Serviços sincronizada.');

    // Agora sincroniza a tabela Schedule, que depende da de Serviços
    await Schedule.sync({ alter: true });
    console.log('Tabela de Agendamentos sincronizada.');

    // Roda uma sincronização final para garantir que o resto esteja ok
    await sequelize.sync({ alter: true });
    console.log('Sincronização final do banco de dados concluída.');

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });

  } catch (error) {
    console.error('Falha ao sincronizar o banco de dados ou iniciar o servidor:', error);
  }
};

startServer();
