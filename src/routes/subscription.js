const router = require('express').Router();
const SubscriptionController = require('../controllers/SubscriptionController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/subscriptions', SubscriptionController.createSubscription);

router.get('/subscription', SubscriptionController.getSubscription);

router.delete('/subscription', SubscriptionController.cancelSubscription);

module.exports = router;
