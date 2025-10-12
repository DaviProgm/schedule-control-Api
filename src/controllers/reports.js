const { Op } = require('sequelize');
const Schedule = require('../models/schedule');
const Client = require('../models/clients');
const moment = require('moment');

const getWeeklyReport = async (req, res) => {
  try {
    const userId = req.user.id;

    // Define date ranges, considering week starts on Sunday
    const today = moment();
    const startOfCurrentWeek = today.clone().startOf('week');
    const endOfCurrentWeek = today.clone().endOf('week');
    const startOfPreviousWeek = today.clone().subtract(1, 'week').startOf('week');
    const endOfPreviousWeek = today.clone().subtract(1, 'week').endOf('week');

    console.log('UserId:', userId);
    console.log('Start of Current Week:', startOfCurrentWeek.format('YYYY-MM-DD'));
    console.log('End of Current Week:', endOfCurrentWeek.format('YYYY-MM-DD'));

    // 1. New clients
    const newClientsThisWeek = await Client.count({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startOfCurrentWeek.toDate(), endOfCurrentWeek.toDate()],
        },
      },
    });

    const newClientsLastWeek = await Client.count({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startOfPreviousWeek.toDate(), endOfPreviousWeek.toDate()],
        },
      },
    });

    const clientIncrease = newClientsThisWeek - newClientsLastWeek;

    // 2. Appointments
    const completedSchedulesResult = await Schedule.findAll({
      where: {
        userId,
        status: 'concluído',
      },
    });
    console.log('Completed Schedules Result:', completedSchedulesResult);
    const completedSchedules = completedSchedulesResult.length;


    const canceledSchedulesResult = await Schedule.findAll({
      where: {
        userId,
        status: 'cancelado',
      },
    });
    console.log('Canceled Schedules Result:', canceledSchedulesResult);
    const canceledSchedules = canceledSchedulesResult.length;


    res.json({
      clientIncrease,
      completedSchedules,
      canceledSchedules,
      period: {
        start: startOfCurrentWeek.format('YYYY-MM-DD'),
        end: endOfCurrentWeek.format('YYYY-MM-DD'),
      }
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório semanal' });
  }
};

module.exports = {
  getWeeklyReport,
};
