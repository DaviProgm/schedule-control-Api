const {DataTypes} = require(sequelize)
const sequelize = require("../config/database");
const Subscription = require('./subscription');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  asaasPaymentId: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'atrasado', 'cancelado'),
    defaultValue: 'pendente',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subscriptions',
      key: 'id',
    }
  }
}, {
  tableName: 'payments',
  freezeTableName: true,
  timestamps: true,
});

Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId' });
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId' });

module.exports = Payment;
