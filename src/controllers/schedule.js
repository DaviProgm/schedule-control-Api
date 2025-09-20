const { Schedule, Client, User } = require('../models');
const { sendSms } = require('../services/sendWhatsapp');
const moment = require('moment');

async function CreateSchedule(req, res) {
    try {
        const { clientId, service, date, time, observations } = req.body;

        if (!clientId || !service || !date || !time) {
            return res.status(400).json({ message: "Campos obrigatórios faltando." });
        }

        const client = await Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ message: "Cliente não encontrado." });
        }

        const schedule = await Schedule.create({
            name: client.name, // usa o nome do cliente aqui
            clientId,
            service,
            date,
            time,
            observations,
            userId: req.user.id,
        });

        // Envia SMS de confirmação
        if (client.phone) {
            const formattedDate = moment(date).format('DD/MM/YYYY');
            const messageBody = `Seu agendamento de ${service} para o dia ${formattedDate} às ${time} foi confirmado.`;

            // Envia o SMS sem bloquear a resposta da API
            sendSms(client.phone, messageBody).catch(err => {
                console.error("Error sending confirmation SMS:", err);
            });
        }

        return res.status(201).json({
            message: 'Agendamento criado com sucesso!',
            schedule,
        });
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        return res.status(500).json({
            message: 'Erro ao criar agendamento.',
            error: error.message,
        });
    }
}

async function GetSchedules(req, res) {
    try {
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
            return res.status(404).send({ message: "Agendamento não encontrado" });
        }

        await schedule.update({ name, service, date, time, observations });

        return res.status(200).send({
            message: "Agendamento atualizado com sucesso!",
            schedule
        });
    } catch (error) {
        console.error("Erro ao atualizar agendamento", error)
        return res.status(500).send({
            message: "Erro interno ao atualizar agendamento.",
            error: error.message
        });
    }
}

async function DeleteSchedules(req, res) {
    try {
        const { id } = req.params;

        const schedule = await Schedule.findByPk(id);
        if (!schedule) {
            return res.status(404).json({ message: "Agendamento não encontrado" })
        }

        await schedule.destroy();
        return res.status(200).json({ message: "Agendamento excluído com sucesso." });

    } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        return res.status(500).json({
            message: "Erro ao excluir agendamento.",
            error: error.message
        });
    }
}

async function UpdateScheduleStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const statusValidos = ["agendado", "confirmado", "em andamento", "concluído", "cancelado"];
        if (!statusValidos.includes(status)) {
            return res.status(400).json({ message: "Status inválido." });
        }

        const [updated] = await Schedule.update(
            { status },
            { where: { id } }
        );

        if (updated === 0) {
            return res.status(404).json({ message: "Agendamento não encontrado." });
        }

        const updatedSchedule = await Schedule.findByPk(id);

        return res.status(200).json({
            message: "Status atualizado com sucesso.",
            schedule: updatedSchedule,
        });
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        return res.status(500).json({
            message: "Erro ao atualizar status.",
            error: error.message,
        });
    }
}
async function GetSchedulesByClient(req, res) {
    try {
        const { clientId } = req.query;

        if (!clientId) {
            return res.status(400).json({ message: "clientId é obrigatório." });
        }

        const schedules = await Schedule.findAll({
            where: { clientId: Number(clientId) },
            order: [['date', 'DESC'], ['time', 'DESC']],
        });

        return res.status(200).json(schedules);
    } catch (error) {
        console.error("Erro ao buscar agendamentos por cliente:", error);
        return res.status(500).json({ message: "Erro interno ao buscar agendamentos." });
    }
}
    async function getSchedulesByProvider(req, res) {
    try {
        const { provider } = req.query; // pega o provider do query string
        if (!provider) {
            return res.status(400).json({ message: "Parâmetro provider é obrigatório." });
        }

        const schedules = await Schedule.findAll({
            where: {
                userId: provider,
                status: 'disponível'
            },
            order: [['date', 'ASC'], ['time', 'ASC']],
        });

        const providerData = await User.findByPk(provider, {
            attributes: ['id', 'name', 'email', 'role']
        });

        return res.status(200).json({ provider: providerData, schedules });
    } catch (error) {
        console.error("Erro ao buscar agendamentos por prestador:", error);
        return res.status(500).json({ message: "Erro interno ao buscar agendamentos." });
    }
}


module.exports = {
    CreateSchedule,
    GetSchedules,
    UpdateSchedule,
    DeleteSchedules,
    UpdateScheduleStatus,
    GetSchedulesByClient,
    getSchedulesByProvider,
};
