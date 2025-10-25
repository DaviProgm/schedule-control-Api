const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');
const Unit = require('./unit');

const UserUnit = sequelize.define('UserUnit', {
  userId: {
    type: DataTypes.INTEGER, // Corrigido para INTEGER
    references: {
      model: User,
      key: 'id',
    },
    primaryKey: true,
  },
  unitId: {
    type: DataTypes.UUID,
    references: {
      model: Unit,
      key: 'id',
    },
    primaryKey: true,
  },
}, {
  tableName: 'user_units',
  freezeTableName: true,
});

// Associações
User.belongsToMany(Unit, { through: UserUnit, foreignKey: 'userId', as: 'units' });
Unit.belongsToMany(User, { through: UserUnit, foreignKey: 'unitId', as: 'users' });

module.exports = UserUnit;
