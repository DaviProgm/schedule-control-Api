const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');

const WorkHour = sequelize.define('WorkHour', {
  dayOfWeek: {
    type: DataTypes.INTEGER, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME, // e.g., '09:00:00'
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME, // e.g., '18:00:00'
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
}, {
  tableName: 'work_hours',
  freezeTableName: true,
  timestamps: true,
});

// A WorkHour belongs to a User
WorkHour.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// A User can have many WorkHours
User.hasMany(WorkHour, { foreignKey: 'userId', as: 'workHours' });

module.exports = WorkHour;
