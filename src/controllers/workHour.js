const { WorkHour, User } = require('../models');
const sequelize = require('../config/database');

// Get all work hours for the logged-in user
const getWorkHours = async (req, res) => {
  try {
    const userId = req.user.id;
    const workHours = await WorkHour.findAll({ 
      where: { userId },
      order: [['dayOfWeek', 'ASC']]
    });
    res.status(200).json(workHours);
  } catch (error) {
    console.error("Error fetching work hours:", error);
    res.status(500).json({ message: 'Erro ao buscar horários de trabalho.' });
  }
};

// Create or update work hours for the logged-in user
const setWorkHours = async (req, res) => {
  const { workHours } = req.body; // Expect an array of work hour objects
  const userId = req.user.id;

  if (!Array.isArray(workHours)) {
    return res.status(400).json({ message: 'O corpo da requisição deve conter um array \'workHours\'.' });
  }

  const t = await sequelize.transaction();

  try {
    // Delete all existing work hours for this user
    await WorkHour.destroy({ where: { userId }, transaction: t });

    // Prepare new work hours with the userId
    const newWorkHours = workHours.map(wh => ({ ...wh, userId }));

    // Bulk create the new work hours
    await WorkHour.bulkCreate(newWorkHours, { transaction: t });

    await t.commit();
    res.status(200).json({ message: 'Horários de trabalho atualizados com sucesso.' });
  } catch (error) {
    await t.rollback();
    console.error("Error setting work hours:", error);
    res.status(500).json({ message: 'Erro ao salvar horários de trabalho.' });
  }
};

module.exports = {
  getWorkHours,
  setWorkHours,
};
