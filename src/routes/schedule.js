const express = require('express');
const router = express.Router();

const ScheduleController = require("../controllers/schedule")
const ScheduleMiddleware = require("../middleware/schedule")

router.post('/agendamentos',
  ScheduleController.CreateSchedule,
  ScheduleMiddleware.ValidateCreateSchedule
);
router.get('/agendamentos', ScheduleController.GetSchedules)
router.put("/agendamentos/:id", ScheduleMiddleware.ValidateCreateSchedule,ScheduleController.UpdateSchedule);
module.exports = router;