const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');

const Service = sequelize.define('Service', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

// A Service belongs to a User
Service.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// A User can have many Services
User.hasMany(Service, { foreignKey: 'userId', as: 'services' });

module.exports = Service;
