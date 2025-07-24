const express = require('express');
const router = express.Router();

const UserController = require('../controllers/users.js');
const middlewareUsers = require('../middleware/users.js');
const { User } = require('../models/users.js');

router.post('/register',
  middlewareUsers.ValidateCreateUser,
  UserController.CreateUser
);
router.get('/',
  UserController.GetUsers
)

module.exports = router;