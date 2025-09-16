const express = require('express');
const router = express.Router();

const ScheduleController = require("../controllers/schedule");
const ScheduleMiddleware = require("../middleware/schedule");

router.post(
  '/',
  ScheduleMiddleware.ValidadeCreateSchedule,
  ScheduleMiddleware.CheckScheduleExists,
  ScheduleController.CreateSchedule
);

router.get('/', ScheduleController.GetSchedules);

router.get('/cliente/:id', ScheduleController.GetSchedulesByClient);

router.get('/provedor/:id', ScheduleController.getSchedulesByProvider);


router.put(
  "/:id",
  ScheduleMiddleware.ValidadeCreateSchedule,
  ScheduleController.UpdateSchedule
);

router.delete('/:id', ScheduleController.DeleteSchedules);

router.put('/:id/status', ScheduleController.UpdateScheduleStatus);
module.exports = router;
