async function ValidadeCreateSchedule(req, res, next) {
  const { name, service, date, time } = req.body;

  if (!name || !service || !date || !time) {
    return res.status(400).send({
      message: "Os campos name, service, date e time são obrigatórios."
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

module.exports = {
  ValidadeCreateSchedule
};
