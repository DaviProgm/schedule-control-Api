const sequelize = require('../config/database'); 
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,     
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  notificationToken: {
  type: DataTypes.STRING,
  allowNull: true,
},
  role: {
    type: DataTypes.ENUM('customer', 'provider'),
    allowNull: false,
    defaultValue: 'customer', 
  }
}, {
  tableName: 'users',      
  freezeTableName: true,   
});


module.exports = { User };

