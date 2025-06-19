const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');


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
        type: DataTypes.TIME,
        allowNull: false,
    },
    observations: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
    {
        tableName: 'schedule',
        freezeTableName: true
    }
)
    module.exports = {Schedule}