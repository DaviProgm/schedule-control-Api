const express = require('express');
const app = express();
const port = 4005;
const cors = require('cors');


const { user } = require('./src/models');
const UserRouter = require('./src/routes/users');
const AuthRouter = require('./src/routes/auth')
const scheduleRoutes = require('./src/routes/schedule');

app.use(cors());
app.use(express.json());

app.use('/users', UserRouter);
app.use('/auth', AuthRouter)
app.use(scheduleRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
