const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');

const Unit = sequelize.define('Unit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'units',
  freezeTableName: true,
});

// Association to the owner
Unit.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Unit, { foreignKey: 'ownerId' });


module.exports = Unit;
