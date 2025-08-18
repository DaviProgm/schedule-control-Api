const sequelize = require("../config/database");
const { DataTypes } = require(sequelize)
const { User } = require('./users');


const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    asaasSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    plan: {
        type: DataTypes.ENUM('basic', 'pro'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pendente', 'ativo', 'canceled', 'overdue'),
        defaultValue: 'pendente'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        }
    }
}, {
    tableName: 'subscription',
    freezeTableName: true,
    timestamps: true
});
Subscription.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Subscription, { foreignKey: 'userId' });

module.exports = Subscription;