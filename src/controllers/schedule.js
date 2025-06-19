require('dotenv').config();
const { Schedule } = require('../models/schedule');

async function CreateSchedule(req, res) {
  try {
    const { name, service, date, time, observations } = req.body;

    const schedule = await Schedule.create({
      name,
      service,
      date,
      time,
      observations
    });

    return res.status(201).json({
      message: 'Agendamento criado com sucesso!',
      schedule
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao criar agendamento.',
      error: error.message
    });
  }
}

module.exports = {
  CreateSchedule
};
