const { User, Service, WorkHour, Schedule, Client } = require('../models');
const sequelize = require('../config/database');
const moment = require('moment');
const { sendEmail } = require('../services/sendWhatsapp');

const getAvailability = async (req, res) => {
  try {
    const { username } = req.params; // Changed from providerId
    const { date, serviceId } = req.query;

    // --- 1. Input Validation ---
    if (!date || !serviceId) {
      return res.status(400).json({ message: 'Os parâmetros \'date\' e \'serviceId\' são obrigatórios.' });
    }

    // --- 2. Fetch Provider by username ---
    const provider = await User.findOne({ where: { username } });
    if (!provider) {
      return res.status(404).json({ message: 'Profissional não encontrado.' });
    }
    const providerId = provider.id; // Use provider.id from now on

    // --- 3. Fetch Data in Parallel -- -
    const [service, existingSchedules] = await Promise.all([
      Service.findOne({ where: { id: serviceId, userId: providerId } }),
      // Include the service in the schedule to get the duration of each existing appointment
      Schedule.findAll({ 
        where: { userId: providerId, date },
        include: { model: Service, as: 'service', attributes: ['duration'] }
      })
    ]);

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado para este profissional.' });
    }

    const dayOfWeek = moment(date).day();
    const workHour = await WorkHour.findOne({ where: { userId: providerId, dayOfWeek } });

    if (!workHour || !workHour.isAvailable) {
      return res.status(200).json([]); // Professional doesn't work on this day, return empty slots
    }

    // --- 4. Generate Potential Time Slots ---
    const serviceDuration = service.duration; // in minutes
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

      // Check for conflicts with existing appointments
      for (const bookedSchedule of existingSchedules) {
        const bookedStartTime = moment(bookedSchedule.time, 'HH:mm:ss');
        // BUG FIX: Use the duration of the *booked* service, not the new one
        const bookedEndTime = moment(bookedStartTime).add(bookedSchedule.service.duration, 'minutes'); 
        
        if (slotTime.isBetween(bookedStartTime, bookedEndTime, undefined, '[)')) {
          return false; // Slot starts during another appointment
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
    // Changed providerId to providerUsername
    const { providerUsername, serviceId, date, time, clientName, clientEmail, clientPhone } = req.body;

    // --- 1. Validate All Inputs ---
    if (!providerUsername || !serviceId || !date || !time || !clientName || !clientEmail) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    // --- 2. Find provider by username and re-check availability ---
    const provider = await User.findOne({ where: { username: providerUsername } });
    if (!provider) {
        return res.status(404).json({ message: "Profissional não encontrado." });
    }
    const providerId = provider.id; // Use provider.id from now on

    const [service, existingSchedules] = await Promise.all([
      Service.findOne({ where: { id: serviceId, userId: providerId } }),
      Schedule.findAll({ where: { userId: providerId, date } })
    ]);

    if (!service) {
        return res.status(404).json({ message: "Serviço não encontrado." });
    }

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

    // --- 3. Find or Create Client ---
    const [client, created] = await Client.findOrCreate({
      where: { email: clientEmail, userId: providerId },
      defaults: { name: clientName, phone: clientPhone, userId: providerId },
      transaction: t
    });

    if (!created && (client.name !== clientName || client.phone !== clientPhone)) {
        await client.update({ name: clientName, phone: clientPhone }, { transaction: t });
    }

    // --- 4. Create the Schedule ---
    const newSchedule = await Schedule.create({
      name: client.name,
      clientId: client.id,
      serviceId,
      date,
      time,
      userId: providerId,
    }, { transaction: t });

    // --- 5. Send Confirmation Email ---
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
                                            Seu agendamento para o serviço de <strong>${service.name}</strong> com <strong>${provider.name}</strong> foi confirmado com sucesso.
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

    // --- 6. Send updated daily schedule to provider if appointment is for today ---
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

const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const provider = await User.findOne({
      where: { username },
      attributes: ['id', 'name', 'username', 'bio', 'foto_perfil_url'], // Public user info
      include: [
        {
          model: Service,
          as: 'services',
          attributes: ['id', 'name', 'duration', 'price'] // Public service info
        },
        {
          model: WorkHour,
          as: 'workHours',
          attributes: ['dayOfWeek', 'startTime', 'endTime', 'isAvailable']
        }
      ]
    });

    if (!provider) {
      return res.status(404).json({ message: 'Profissional não encontrado.' });
    }

    res.status(200).json(provider);

  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: 'Erro ao buscar perfil público.' });
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