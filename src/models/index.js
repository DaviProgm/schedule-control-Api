const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./users');
const Client = require('./clients');
const Schedule = require('./schedule');
const Subscription = require('./subscription');
const Payment = require('./payment');
const SupportTicket = require('./supportTicket');
const Service = require('./service');
const WorkHour = require('./workHour');

const db = {
  Sequelize, // Add this line
  sequelize,
  User,
  Client,
  Schedule,
  Subscription,
  Payment,
  SupportTicket,
  Service,
  WorkHour,
};

// This is a placeholder for running associations if they were defined in a separate method
// Since they are already run in each model file upon import, this block is not strictly necessary
// but it is good practice for future extensions.
Object.values(db).forEach(model => {
  if (model && model.associate) {
    model.associate(db);
  }
});

module.exports = db;