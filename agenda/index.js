'use strict';
const Agenda = require('agenda');
const {MONGO_URI} = require('../config');
const agenda = new Agenda({
  db: {
    address: MONGO_URI
  }
});

const createReminder = require('./createReminder');
const showReminders = require('./showReminders');
const cancelReminder = require('./cancelReminder');

module.exports = (f) => {
  // Define Agenda jobs

  // Create a reminder
  createReminder(agenda, f);

  // Show reminders
  showReminders(agenda, f);

  // Cancel Reminder
  cancelReminder(agenda, f);

  return agenda;
}
