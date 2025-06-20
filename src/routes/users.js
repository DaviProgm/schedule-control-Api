const express = require('express');
const router = express.Router();

const UserController = require('../controllers/users.js');
const middlewareUsers = require('../middleware/users.js');

router.post('/register',
  middlewareUsers.ValidateCreateUser,
  UserController.CreateUser
);
 

module.exports = router;