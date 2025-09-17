const express = require('express');
const router = express.Router();
const {Login, forgotPassword, resetPassword} = require('../controllers/auth')

router.post('/login', Login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)



module.exports = router;