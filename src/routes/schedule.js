const express = require('express');
const router = express.Router();

const ScheduleController = require("../controllers/schedule");
const ScheduleMiddleware = require("../middleware/schedule");
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post(
  '/agendamentos',
  ScheduleMiddleware.ValidadeCreateSchedule,
  ScheduleController.CreateSchedule
);

router.get('/agendamentos', (req, res) => {
  if (req.query.clientId) {
    return ScheduleController.GetSchedulesByClient(req, res);
  }
  return ScheduleController.GetSchedules(req, res);
});
router.get('/agendamentos', (req, res) => {
  if (req.query.clientId) {
    return ScheduleController.GetSchedulesByClient(req, res);
  }
  return ScheduleController.GetSchedules(req, res);
});

router.put(
  "/agendamentos/:id",
  ScheduleMiddleware.ValidadeCreateSchedule,
  ScheduleController.UpdateSchedule
);

router.delete('/agendamentos/:id', ScheduleController.DeleteSchedules);

router.put('/agendamentos/:id/status', ScheduleController.UpdateScheduleStatus);

module.exports = router;
