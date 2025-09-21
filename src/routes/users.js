const express = require('express');
const router = express.Router();

const UserController = require('../controllers/users.js');
const middlewareUsers = require('../middleware/users.js');
const authMiddleware = require('../middleware/auth.js');
const { User } = require('../models/users.js');

router.post('/register',
  middlewareUsers.ValidateCreateUser,
  UserController.CreateUser
);
router.get('/',
  UserController.GetUsers
)

// Route to update the user's own profile (bio, username, etc.)
router.put('/profile',
  authMiddleware,
  UserController.updateProfile
);

// Route to get the user's own profile
router.get('/profile',
  authMiddleware,
  UserController.getProfile
);

// Route to set default work hours for a specific user
router.post('/:userId/set-default-work-hours',
  authMiddleware,
  UserController.setDefaultWorkHours
);

module.exports = router;