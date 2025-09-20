const { Schedule, Client, User, Service } = require('../models');
const { sendEmail } = require('../services/sendWhatsapp');
const { sendDailyScheduleEmail } = require('../services/providerNotificationService');
const moment = require('moment');

// Includes common to most queries
const commonIncludes = [
  { model: Client, as: 'client', attributes: ['id', 'name', 'email', 'phone'] },
  { model: Service, as: 'service', attributes: ['id', 'name', 'duration', 'price'] },
];

async function CreateSchedule(req, res) {
    try {
        const { clientId, serviceId, date, time, observations } = req.body;

        if (!clientId || !serviceId || !date || !time) {
            return res.status(400).json({ message: "Campos clientId, serviceId, date e time são obrigatórios." });
        }

        const client = await Client.findByPk(clientId);
        if (!client || client.userId !== req.user.id) {
            return res.status(404).json({ message: "Cliente não encontrado ou não pertence a este usuário." });
        }

        const service = await Service.findByPk(serviceId);
        if (!service || service.userId !== req.user.id) {
            return res.status(404).json({ message: "Serviço não encontrado ou não pertence a este usuário." });
        }

        const schedule = await Schedule.create({
            name: client.name,
            clientId,
            serviceId,
            date,
            time,
            observations,
            userId: req.user.id,
        });

        // Envia Email de confirmação para o cliente
        if (client.email) {
            const formattedDate = moment(date).format('DD/MM/YYYY');
            const subject = `Confirmação de Agendamento: ${service.name}`;
            const htmlBody = `
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" style="padding: 20px 0;">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
                                <tr>
                                    <td align="center" style="padding: 30px 20px; background-color: #0b0b0d; color: #ffffff;">
                                        <img src="https://i.ibb.co/CpRdNxXP/Design-sem-nome-3.png" alt="Workgate Logo" width="180" style="display: block; margin-bottom: 20px;"/>
                                        <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Agendamento Confirmado!</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px; color: #333333;">
                                        <p style="font-size: 16px; margin: 0 0 20px;">Olá, ${client.name},</p>
                                        <p style="font-size: 16px; line-height: 1.5;">
                                            Seu agendamento para o serviço de <strong>${service.name}</strong> foi confirmado com sucesso.
                                        </p>
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                            <tr>
                                                <td align="center" style="padding: 20px; background-color: #f9f9f9; border: 1px solid #eeeeee; border-radius: 5px;">
                                                    <p style="font-size: 18px; margin: 0; color: #333333;">
                                                        <strong>Data:</strong> ${formattedDate}<br>
                                                        <strong>Hora:</strong> ${time}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="font-size: 16px;">Se precisar de qualquer alteração, por favor, entre em contato.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 20px; font-size: 12px; color: #888888; background-color: #f4f4f4;">
                                        <p style="margin: 0;">Este é um e-mail automático, por favor não responda.</p>
                                        <p style="margin: 5px 0 0;">© 2025 Workgate</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            `;
            sendEmail(client.email, subject, htmlBody).catch(err => console.error("Error sending confirmation email:", err));
        }

        // Se o agendamento for para hoje, envia a agenda atualizada para o prestador
        if (moment(date).isSame(moment(), 'day')) {
            sendDailyScheduleEmail(req.user.id).catch(err => {
                console.error("Error sending provider schedule update email:", err);
            });
        }

        const newSchedule = await Schedule.findByPk(schedule.id, { include: commonIncludes });

        return res.status(201).json({
            message: 'Agendamento criado com sucesso!',
            schedule: newSchedule,
        });
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        return res.status(500).json({ message: 'Erro ao criar agendamento.', error: error.message });
    }
}

async function GetSchedules(req, res) {
    try {
        const schedules = await Schedule.findAll({
            where: { userId: req.user.id },
            include: commonIncludes,
            order: [['date', 'ASC'], ['time', 'ASC']],
        });
        return res.status(200).json(schedules);
    } catch (error) {
        console.error("Erro ao buscar agendamentos", error);
        return res.status(500).send({ message: 'Erro ao buscar agendamentos', error: error.message });
    }
}

async function UpdateSchedule(req, res) {
    try {
        const { id } = req.params;
        const { serviceId, date, time, observations } = req.body;

        const schedule = await Schedule.findOne({ where: { id, userId: req.user.id }});
        if (!schedule) {
            return res.status(404).send({ message: "Agendamento não encontrado" });
        }

        if (serviceId) {
            const service = await Service.findByPk(serviceId);
            if (!service || service.userId !== req.user.id) {
                return res.status(404).json({ message: "Serviço não encontrado ou não pertence a este usuário." });
            }
        }

        await schedule.update({ serviceId, date, time, observations });

        const updatedSchedule = await Schedule.findByPk(id, { include: commonIncludes });

        return res.status(200).send({ message: "Agendamento atualizado com sucesso!", schedule: updatedSchedule });
    } catch (error) {
        console.error("Erro ao atualizar agendamento", error)
        return res.status(500).send({ message: "Erro interno ao atualizar agendamento.", error: error.message });
    }
}

async function DeleteSchedules(req, res) {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findOne({ where: { id, userId: req.user.id }});
        if (!schedule) {
            return res.status(404).json({ message: "Agendamento não encontrado" })
        }
        await schedule.destroy();
        return res.status(200).json({ message: "Agendamento excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        return res.status(500).json({ message: "Erro ao excluir agendamento.", error: error.message });
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
        const [updated] = await Schedule.update({ status }, { where: { id, userId: req.user.id } });
        if (updated === 0) {
            return res.status(404).json({ message: "Agendamento não encontrado." });
        }
        const updatedSchedule = await Schedule.findByPk(id, { include: commonIncludes });
        return res.status(200).json({ message: "Status atualizado com sucesso.", schedule: updatedSchedule });
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        return res.status(500).json({ message: "Erro ao atualizar status.", error: error.message });
    }
}

async function GetSchedulesByClient(req, res) {
    try {
        const { clientId } = req.query;
        if (!clientId) {
            return res.status(400).json({ message: "clientId é obrigatório." });
        }
        const schedules = await Schedule.findAll({
            where: { clientId: Number(clientId), userId: req.user.id },
            include: commonIncludes,
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
        const { provider } = req.query;
        if (!provider) {
            return res.status(400).json({ message: "Parâmetro provider é obrigatório." });
        }
        const schedules = await Schedule.findAll({
            where: { userId: provider, status: 'disponível' },
            include: commonIncludes,
            order: [['date', 'ASC'], ['time', 'ASC']],
        });
        const providerData = await User.findByPk(provider, { attributes: ['id', 'name', 'email', 'role'] });
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