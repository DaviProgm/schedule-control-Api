const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');

const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'closed'),
    defaultValue: 'open',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'support_tickets',
  freezeTableName: true,
  timestamps: true,
});

SupportTicket.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(SupportTicket, { foreignKey: 'userId' });

module.exports = SupportTicket;
