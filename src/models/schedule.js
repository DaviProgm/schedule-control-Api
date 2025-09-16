const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');


const Schedule = sequelize.define('Schedule', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
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
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "agendado",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: true,  // aceita null temporariamente
    references: {
      model: 'clients',
      key: 'id',
    }
  }
  },
{
    tableName: 'schedules',
    freezeTableName: true,
    timestamps: true,
  });

Schedule.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Schedule, { foreignKey: 'userId' });

module.exports = Schedule;
