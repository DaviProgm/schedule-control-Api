const express = require('express');
const router = express.Router();

const ScheduleController = require("../controllers/schedule")
const ScheduleMiddleware = require("../middleware/schedule")

router.post('/agendamento',
  ScheduleController.CreateSchedule,
  ScheduleMiddleware.ValidadeCreateSchedule
);


module.exports = router;