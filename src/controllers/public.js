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
      Schedule.findAll({ where: { userId: providerId, date } })
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
    const bookedTimes = existingSchedules.map(schedule => moment(schedule.time, 'HH:mm:ss'));

    const availableSlots = potentialSlots.filter(slot => {
      const slotTime = moment(slot, 'HH:mm');
      
      if (moment(date).isSame(moment(), 'day') && slotTime.isBefore(moment())) {
        return false;
      }

      for (const bookedTime of bookedTimes) {
        const bookedEndTime = moment(bookedTime).add(serviceDuration, 'minutes');
        if (slotTime.isBetween(bookedTime, bookedEndTime, undefined, '[)')) {
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
      <p>Olá, ${client.name},</p>
      <p>Seu agendamento para o serviço de <strong>${service.name}</strong> com <strong>${provider.name}</strong> foi confirmado com sucesso.</p>
      <p><strong>Data:</strong> ${formattedDate}</p>
      <p><strong>Hora:</strong> ${time}</p>
    `; // Simplified for brevity
    sendEmail(client.email, subject, htmlBody).catch(err => console.error("Error sending confirmation email:", err));

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
      attributes: ['id', 'name', 'username', 'bio'], // Public user info
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

module.exports = {
  getAvailability,
  createPublicSchedule,
  getPublicProfile,
};