const { Schedule, Client, User } = require('../models');
const { sendEmail } = require('../services/sendWhatsapp');
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

        // Envia Email de confirmação com template HTML
        if (client.email) {
            const formattedDate = moment(date).format('DD/MM/YYYY');
            const subject = `Confirmação de Agendamento: ${service}`;
            const htmlBody = `
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" style="padding: 20px 0;">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden;">
                                <tr>
                                    <td align="center" style="padding: 30px 20px; background-color: #6b0082; color: #ffffff;">
                                        <img src="https://i.ibb.co/svh74hCH/Whats-App-Image-2025-09-18-at-01-23-19-removebg-preview.png" alt="Workgate Logo" width="180" style="display: block; margin-bottom: 20px;"/>
                                        <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Agendamento Confirmado!</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px; color: #333333;">
                                        <p style="font-size: 16px; margin: 0 0 20px;">Olá, ${client.name},</p>
                                        <p style="font-size: 16px; line-height: 1.5;">
                                            Seu agendamento para o serviço de <strong>${service}</strong> foi confirmado com sucesso.
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

            // Envia o Email sem bloquear a resposta da API
            sendEmail(client.email, subject, htmlBody).catch(err => {
                console.error("Error sending confirmation email:", err);
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
