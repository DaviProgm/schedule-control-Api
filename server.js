const express = require('express');
const app = express();
const port = 4005;

const { User } = require('./src/models');
const UserRouter = require('./src/routes/users');

app.use(express.json());
app.use('/users', UserRouter);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
