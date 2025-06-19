const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  observations: {
    type: DataTypes.TEXT, 
    allowNull: true, 
  },
}, {
  tableName: 'schedules',
  freezeTableName: true,
  timestamps: true,
});

module.exports = Schedule;
