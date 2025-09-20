const Schedule = require('../models/schedule');

async function ValidadeCreateSchedule(req, res, next) {
  const { clientId, serviceId, date, time } = req.body;

  if (!clientId || !serviceId || !date || !time) {
    return res.status(400).send({
      message: "Os campos clientId, serviceId, date e time são obrigatórios."
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;  
  if (!dateRegex.test(date)) {
    return res.status(400).send({
      message: "Data inválida. Use o formato YYYY-MM-DD."
    });
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return res.status(400).send({
      message: "Hora inválida. Use o formato HH:MM."
    });
  }

  next();
}
async function CheckScheduleExists(req, res, next) {
  const { id } = req.params;
  const { date, time } = req.body;
  const userId = req.user.id;
  
  const exists = await Schedule.findOne({
    where: { userId, date, time }
  });
  if (exists) {
    return res.status(400).json({ message: "Horário já ocupado para esse prestador." });
  }
  next();

}


module.exports = {
  ValidadeCreateSchedule,
  CheckScheduleExists
};
