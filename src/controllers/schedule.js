// controllers/schedule.js
const Schedule = require('../models/schedule');
async function CreateSchedule(req, res) {
    try {
        const { name, service, date, time, observations } = req.body;

        const userId = req.userId;

        const schedule = await Schedule.create({
            name,
            service,
            date,
            time,
            observations,
            userId: req.user.id,

        });

        return res.status(201).json({
            message: 'Agendamento criado com sucesso!',
            schedule
        });
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        return res.status(500).json({
            message: 'Erro ao criar agendamento.',
            error: error.message
        });
    }
}
async function GetSchedules(req, res) {
    try {
        const userId = req.user.id;

        const schedules = await Schedule.findAll({
            where: { userId: req.user.id },
            order: [['date', 'ASC'], ['time', 'ASC']],
        });

        return res.status(200).json(schedules);
    } catch (error) {
        console.error("Erro ao buscar agendamentos", error);
        return res.status(500).send({
            message: 'Erro ao buscar agendamentos',
            error: error.message
        });
    }
}


async function UpdateSchedule(req, res) {
    try {
        const { id } = req.params;
        const { name, service, date, time, observations } = req.body;

        const schedule = await Schedule.findByPk(id);
        if (!schedule) {
            return res.status(404).send({ message: "agendamento não encontrado" });
        };
        await schedule.update({ name, service, date, time, observations });

        return res.status(200).send({
            message: "Agendamento atualizado com sucesso!",
            schedule
        });
    } catch (error) {
        console.error("erro ao atualizar agendamento", error)
        return res.status(500).send({
            message: "Erro interno ao atualizar agendamento.",
            error: error.message
        });
    }
}
module.exports = {
    CreateSchedule,
    GetSchedules,
    UpdateSchedule
};
