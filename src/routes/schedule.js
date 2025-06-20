const express = require('express');
const router = express.Router();

const ScheduleController = require("../controllers/schedule")
const ScheduleMiddleware = require("../middleware/schedule")
const authMiddleware = require('../middleware/auth');
const DeleteSchedule = require("../middleware/schedule")

router.use(authMiddleware); 

router.post('/agendamentos',
  ScheduleMiddleware.ValidadeCreateSchedule,
  ScheduleController.CreateSchedule
);

router.get('/agendamentos', ScheduleController.GetSchedules)
router.put("/agendamentos/:id", ScheduleMiddleware.ValidadeCreateSchedule,ScheduleController.UpdateSchedule);
router.delete('/:id', ScheduleController.DeleteSchedules);
module.exports = router;