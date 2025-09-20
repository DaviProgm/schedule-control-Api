const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service');
const authMiddleware = require('../middleware/auth');

// All service routes are protected
router.use(authMiddleware);

// Routes for /services
router.route('/')
  .get(serviceController.getAllServices)
  .post(serviceController.createService);

// Routes for /services/:id
router.route('/:id')
  .get(serviceController.getServiceById)
  .put(serviceController.updateService)
  .delete(serviceController.deleteService);

module.exports = router;
