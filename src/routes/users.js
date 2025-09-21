const express = require('express');
const router = express.Router();

const UserController = require('../controllers/users.js');
const middlewareUsers = require('../middleware/users.js');
const authMiddleware = require('../middleware/auth.js');
const { uploader, addFileUrlToBody } = require('../middleware/localUpload.js');
const { User } = require('../models/users.js');

router.post('/register',
  middlewareUsers.ValidateCreateUser,
  UserController.CreateUser
);
router.get('/',
  UserController.GetUsers
)

// The uploader.single() middleware parses the file from the 'profilePicture' field and saves it to disk
// The addFileUrlToBody middleware creates the public URL and adds it to the request
// The UserController.updateProfile controller saves the URL and other bio info
router.put('/profile',
  authMiddleware,
  uploader.single('profilePicture'),
  addFileUrlToBody,
  UserController.updateProfile
);

module.exports = router;