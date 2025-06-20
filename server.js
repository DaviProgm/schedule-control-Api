const express = require('express');
const app = express();
const port = 4005;
const cors = require('cors');


const { user } = require('./src/models');
const UserRouter = require('./src/routes/users');
const AuthRouter = require('./src/routes/auth')
const scheduleRoutes = require('./src/routes/schedule');
const notificationRoutes = require('./src/routes/notifications');


app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`REQ: ${req.method} ${req.url}`);
  next();
});

app.use('/users', UserRouter);
app.use('/auth', AuthRouter)
app.use('/schedule', scheduleRoutes);
app.use('/api', notificationRoutes)

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
