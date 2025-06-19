const {Schedule} = require('../models/schedule')

async function ValidateCreateSchedule(req, res, next) {
  const { name, service, date, time, observations } = req.body;

  if (!name || !service || !date || !time || !observations) {
    return res.status(400).send({
      message: "Todos os campos são obrigatórios",
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD (padrão para DateOnly do Sequelize)
  if (!dateRegex.test(date)) {
    return res.status(400).send({
      message: "Data inválida. Use o formato YYYY-MM-DD.",
    });
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // 24h format
  if (!timeRegex.test(time)) {
    return res.status(400).send({
      message: "Hora inválida. Use o formato HH:MM.",
    });
  }

  next();
}

module.exports = {
  ValidateCreateSchedule,
};
