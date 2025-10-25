const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');
const Client = require('./clients');
const Service = require('./service');
const Unit = require('./unit'); // Novo

const Schedule = sequelize.define('Schedule', {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
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
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id',
    }
  },
  serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
          model: 'services',
          key: 'id'
      }
  },
  unitId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'units',
      key: 'id'
    }
  }
},
{
    tableName: 'schedules',
    freezeTableName: true,
    timestamps: true,
  });

// Associations
Schedule.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Schedule, { foreignKey: 'userId', as: 'schedules' });

Schedule.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Schedule, { foreignKey: 'clientId', as: 'schedules' });

Schedule.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Service.hasMany(Schedule, { foreignKey: 'serviceId', as: 'schedules' });

Schedule.belongsTo(Unit, { foreignKey: 'unitId', as: 'unit' }); // Nova associação
Unit.hasMany(Schedule, { foreignKey: 'unitId', as: 'schedules' }); // Nova associação

module.exports = Schedule;