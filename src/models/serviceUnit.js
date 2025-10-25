const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Service = require('./service');
const Unit = require('./unit');

const ServiceUnit = sequelize.define('ServiceUnit', {
  serviceId: {
    type: DataTypes.INTEGER, // Corrigido para INTEGER
    references: {
      model: Service,
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
  tableName: 'service_units',
  freezeTableName: true,
});

// Associações
Service.belongsToMany(Unit, { through: ServiceUnit, foreignKey: 'serviceId', as: 'units' });
Unit.belongsToMany(Service, { through: ServiceUnit, foreignKey: 'unitId', as: 'services' });

module.exports = ServiceUnit;
