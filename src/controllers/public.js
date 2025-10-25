const { User, Service, WorkHour, Schedule, Client, Unit, UserUnit, ServiceUnit } = require('../models');
const sequelize = require('../config/database');
const moment = require('moment');
const { sendEmail } = require('../services/sendWhatsapp');
const { Op } = require('sequelize');


const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params; // This is the owner's username

    // 1. Find the owner
    const owner = await User.findOne({
      where: { username, role: 'owner' },
      attributes: ['id', 'name', 'username', 'bio', 'foto_perfil_url', 'cor_perfil', 'professional_photo_url'],
    });

    if (!owner) {
      return res.status(404).json({ message: 'Negócio não encontrado.' });
    }

    // 2. Find professionals, units, and services belonging to the owner
    const [professionals, units, businessServices] = await Promise.all([
      User.findAll({
        where: { ownerId: owner.id, role: 'provider' },
        attributes: ['id', 'name', 'bio', 'foto_perfil_url', 'professional_photo_url'],
        include: [
          {
            model: WorkHour,
            as: 'workHours',
            attributes: ['dayOfWeek', 'startTime', 'endTime', 'isAvailable']
          }
        ]
      }),
      Unit.findAll({
        where: { ownerId: owner.id },
        attributes: ['id', 'name', 'address', 'phone']
      }),
      Service.findAll({
        where: { userId: owner.id }, // Fetch services owned by the owner
        attributes: ['id', 'name', 'duration', 'price'],
      })
    ]);

    // 3. Structure and send the response
    const publicProfile = {
      owner: owner,
      professionals: professionals,
      units: units,
      services: businessServices, // Use the services fetched for the owner
    };

    res.status(200).json(publicProfile);

  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: 'Erro ao buscar perfil público.' });
  }
};


const getAvailability = async (req, res) => {
  try {
    const { username } = req.params; // owner's username
    const { date, serviceId, professionalId, unitId } = req.query;

    // --- 1. Input Validation ---
    if (!date || !serviceId || !professionalId) {
      return res.status(400).json({ message: 'Os parâmetros \'date\', \'serviceId\', e \'professionalId\' são obrigatórios.' });
    }

    // --- 2. Fetch Owner and Professional, and verify relationship ---
    const owner = await User.findOne({ where: { username, role: 'owner' } });
    if (!owner) {
        return res.status(404).json({ message: 'Negócio não encontrado.' });
    }

    const professional = await User.findOne({
        where: {
            id: professionalId,
            ownerId: owner.id,
            role: 'provider'
        }
    });

    if (!professional) {
      return res.status(404).json({ message: 'Profissional não encontrado ou não pertence a este negócio.' });
    }
    
    const providerId = professional.id;

    // --- 3. Fetch Data in Parallel ---
    // The service must belong to the owner
    const service = await Service.findOne({ where: { id: serviceId, userId: owner.id } });
    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado para este negócio.' });
    }

    const existingSchedules = await Schedule.findAll({
      where: {
        userId: providerId,
        date,
        ...(unitId && { unitId })
      },
      include: { model: Service, as: 'service', attributes: ['duration'] }
    });

    const dayOfWeek = moment(date).day();
    const workHour = await WorkHour.findOne({ where: { userId: providerId, dayOfWeek } });

    if (!workHour || !workHour.isAvailable) {
      return res.status(200).json([]);
    }

    // --- 4. Generate Potential Time Slots ---
    const serviceDuration = service.duration;
    const potentialSlots = [];
    let currentTime = moment(workHour.startTime, 'HH:mm:ss');
    const endTime = moment(workHour.endTime, 'HH:mm:ss');

    while (currentTime.isBefore(endTime)) {
      potentialSlots.push(currentTime.format('HH:mm'));
      currentTime.add(serviceDuration, 'minutes');
    }

    // --- 5. Filter Out Booked and Conflicting Slots ---
    const availableSlots = potentialSlots.filter(slot => {
      const slotTime = moment(slot, 'HH:mm');
      
      if (moment(date).isSame(moment(), 'day') && slotTime.isBefore(moment())) {
        return false;
      }

      for (const bookedSchedule of existingSchedules) {
        const bookedStartTime = moment(bookedSchedule.time, 'HH:mm:ss');
        const bookedEndTime = moment(bookedStartTime).add(bookedSchedule.service.duration, 'minutes'); 
        
        if (slotTime.isBetween(bookedStartTime, bookedEndTime, undefined, '[)')) {
          return false;
        }
      }
      return true;
    });

    res.status(200).json(availableSlots);

  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: 'Erro ao buscar disponibilidade.' });
  }
};

const createPublicSchedule = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { professionalId, serviceId, date, time, clientName, clientEmail, clientPhone, unitId } = req.body;

    // --- 1. Validate All Inputs ---
    if (!professionalId || !serviceId || !date || !time || !clientName || !clientEmail) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    // --- 2. Find professional and their owner ---
    const professional = await User.findOne({
        where: { id: professionalId, role: 'provider' },
        include: { model: User, as: 'owner' }
    });

    if (!professional || !professional.owner) {
      return res.status(404).json({ message: "Profissional ou negócio associado não encontrado." });
    }
    const owner = professional.owner;
    const providerId = professional.id;

    // --- 3. Re-check availability ---
    const service = await Service.findOne({ where: { id: serviceId, userId: owner.id } });
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado para este negócio." });
    }

    if (unitId) {
      const unit = await Unit.findOne({ where: { id: unitId, ownerId: owner.id } });
      if (!unit) {
        return res.status(404).json({ message: "Unidade não encontrada ou não pertence a este negócio." });
      }
    }

    const existingSchedules = await Schedule.findAll({
      where: {
        userId: providerId,
        date,
        ...(unitId && { unitId })
      }
    });

    const dayOfWeek = moment(date).day();
    const workHour = await WorkHour.findOne({ where: { userId: providerId, dayOfWeek } });
    const requestedTime = moment(time, 'HH:mm');

    if (!workHour || !workHour.isAvailable || requestedTime.isBefore(moment(workHour.startTime, 'HH:mm')) || requestedTime.isAfter(moment(workHour.endTime, 'HH:mm'))) {
      return res.status(409).json({ message: "O horário solicitado está fora do horário de trabalho do profissional." });
    }

    for (const schedule of existingSchedules) {
      const bookedTime = moment(schedule.time, 'HH:mm');
      const bookedEndTime = moment(bookedTime).add(service.duration, 'minutes');
      if (requestedTime.isBetween(bookedTime, bookedEndTime, undefined, '[)')) {
        return res.status(409).json({ message: "Este horário não está mais disponível. Por favor, escolha outro." });
      }
    }

    // --- 4. Find or Create Client ---
    // The client is associated with the business owner.
    const [client, created] = await Client.findOrCreate({
      where: { email: clientEmail, ownerId: owner.id },
      defaults: { name: clientName, phone: clientPhone, ownerId: owner.id },
      transaction: t
    });

    if (!created && (client.name !== clientName || client.phone !== clientPhone)) {
      await client.update({ name: clientName, phone: clientPhone }, { transaction: t });
    }

    // --- 5. Create the Schedule ---
    const newSchedule = await Schedule.create({
      name: client.name,
      clientId: client.id,
      serviceId,
      date,
      time,
      userId: providerId, // The professional who will perform the service
      unitId: unitId || null,
    }, { transaction: t });

    // --- 6. Send Confirmation Email ---
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
                                        <img src="https://i.ibb.co/4Zt4PpDZ/Design-sem-nome-3.png" alt="Workgate Logo" width="180" style="display: block; margin-bottom: 20px;"/>
                                        <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Agendamento Confirmado!</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px; color: #333333;">
                                        <p style="font-size: 16px; margin: 0 0 20px;">Olá, ${client.name},</p>
                                        <p style="font-size: 16px; line-height: 1.5;">
                                            Seu agendamento para o serviço de <strong>${service.name}</strong> com <strong>${professional.name}</strong> foi confirmado com sucesso.
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

    // --- 7. Send updated daily schedule to provider if appointment is for today ---
    if (moment(date).isSame(moment(), 'day')) {
      const { sendDailyScheduleEmail } = require('../services/providerNotificationService');
      sendDailyScheduleEmail(providerId).catch(err => {
        console.error("Error sending provider schedule update email:", err);
      });
    }

    await t.commit();
    res.status(201).json(newSchedule);

  } catch (error) {
    await t.rollback();
    console.error("Error creating public schedule:", error);
    res.status(500).json({ message: 'Erro ao criar agendamento.' });
  }
};


const getPublicClientProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'foto_perfil_url'],
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }

    res.status(200).json(client);

  } catch (error) {
    console.error("Error fetching public client profile:", error);
    res.status(500).json({ message: 'Erro ao buscar perfil público do cliente.' });
  }
};

const debugAvailability = async (req, res) => {
  try {
    const { username } = req.params;
    const { date, serviceId } = req.query;

    const provider = await User.findOne({ where: { username } });
    if (!provider) {
      return res.status(404).json({ message: 'Debug: Profissional não encontrado.' });
    }
    const providerId = provider.id;

    const service = await Service.findOne({ where: { id: serviceId, userId: providerId } });
    const existingSchedules = await Schedule.findAll({ 
      where: { userId: providerId, date },
      include: { model: Service, as: 'service', attributes: ['duration'] }
    });
    
    const dayOfWeek = moment(date).day();
    const workHour = await WorkHour.findOne({ where: { userId: providerId, dayOfWeek } });

    const debugData = {
      inputs: { username, date, serviceId },
      foundProvider: {
        id: provider.id,
        name: provider.name,
        username: provider.username,
      },
      foundService: service,
      foundWorkHourForDay: workHour,
      foundExistingSchedulesOnDate: existingSchedules,
      serverTime: {
        time: moment().format(),
        timezone: moment.tz.guess(),
      },
      parsedDate: {
        input: date,
        dayOfWeek: dayOfWeek,
        momentObject: moment(date).format(),
      }
    };

    res.status(200).json(debugData);

  } catch (error) {
    res.status(500).json({ message: 'Erro no endpoint de debug.', error: error.message });
  }
};

module.exports = {
  getAvailability,
  createPublicSchedule,
  getPublicProfile,
  getPublicClientProfile,
  debugAvailability,
};