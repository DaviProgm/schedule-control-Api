const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { User } = require('./users');


const Schedule = sequelize.define('Schedule', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  observations: {
    type: DataTypes.TEXT,
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

},
  {
    tableName: 'schedules',
    freezeTableName: true,
    timestamps: true,
  });

Schedule.belongsTo(User, { foreignKey: 'userID' });
User.hasMany(Schedule, { foreignKey: 'userId' });

module.exports = Schedule;
