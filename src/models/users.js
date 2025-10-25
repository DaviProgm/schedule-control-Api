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
  username: {
    type: DataTypes.STRING,
    allowNull: true, // Will be set automatically after creation
    unique: true,
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
    type: DataTypes.ENUM('customer', 'provider', 'owner'),
    allowNull: false,
    defaultValue: 'customer',
  },
  asaasCustomerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  foto_perfil_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  professional_photo_url: { // Novo campo
    type: DataTypes.STRING,
    allowNull: true,
  },
  cor_perfil: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#FFFFFF' // Default to white
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'users',
  freezeTableName: true,
});

// Self-referencing association for owner/professional hierarchy
User.hasMany(User, { as: 'professionals', foreignKey: 'ownerId', onDelete: 'CASCADE' });
User.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });


module.exports = User;

