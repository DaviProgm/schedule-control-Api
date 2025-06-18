const sequelize = require('../config/database');
const User = require('./users');

async function initializeDatabase() {
  try {
    await sequelize.sync({ alter: true }); 
    console.log('Banco sincronizado!');
  } catch (error) {
    console.error('Erro ao sincronizar banco:', error);
  }
}

initializeDatabase();

module.exports = {
  sequelize,
  User,
};
