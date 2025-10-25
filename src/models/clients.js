const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');

const Client = sequelize.define('Client', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false, // Keep this, email is required
        validate: {
            isEmail: {
                msg: "Formato de e-mail inválido."
            }
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    foto_perfil_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Renaming userId to ownerId for clarity. The client belongs to the business owner.
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Temporarily allow null to migrate existing data
        references: {
            model: 'users', // references the users table
            key: 'id'
        }
    }
}, {
    tableName: 'clients',
    freezeTableName: true,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['email', 'ownerId'] // Composite unique key
        }
    ]
});

// A Client belongs to an Owner (which is a User)
Client.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Client, { as: 'businessClients', foreignKey: 'ownerId' });

module.exports = Client;
