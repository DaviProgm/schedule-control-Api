const express = require('express');
const router = express.Router();

const ScheduleController = require("../controllers/schedule");
const ScheduleMiddleware = require("../middleware/schedule");
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post(
  '/agendamentos',
  ScheduleMiddleware.ValidadeCreateSchedule,
  ScheduleMiddleware.CheckScheduleExists,
  ScheduleController.CreateSchedule
);

router.get('/agendamentos', ScheduleController.GetSchedules);

router.get('/agendamentos/cliente/:id', ScheduleController.GetSchedulesByClient);

router.get('/agendamentos/provedor/:id', ScheduleController.getSchedulesByProvider);


router.put(
  "/agendamentos/:id",
  ScheduleMiddleware.ValidadeCreateSchedule,
  ScheduleController.UpdateSchedule
);

router.delete('/agendamentos/:id', ScheduleController.DeleteSchedules);

router.put('/agendamentos/:id/status', ScheduleController.UpdateScheduleStatus);
module.exports = router;
