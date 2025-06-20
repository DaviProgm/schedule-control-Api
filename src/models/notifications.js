const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {               
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  phoneNumber: {       
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {               
    type: DataTypes.STRING,
    allowNull: false,
  },
  sentAt: {           
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'notifications',
  freezeTableName: true,
  timestamps: true, 
});

module.exports = { Notification };
