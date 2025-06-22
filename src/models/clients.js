const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { User } = require('./users');

const Client = sequelize.define('Client', {

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: "Formato de e-mail inválido."
            }
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'clients',
    freezeTableName: true,
    timestamps: true,
});

Client.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Client, { foreignKey: 'userId' });

module.exports = Client;