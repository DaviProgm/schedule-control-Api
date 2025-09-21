const multer = require('multer');
const path = require('path');

// Configure local disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploader = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});

// Middleware to construct the file URL after upload
const addFileUrlToBody = (req, res, next) => {
  if (!req.file) {
    // If no file is uploaded, just skip.
    return next();
  }

  // IMPORTANT: You need to set API_URL in your .env file
  // Example: API_URL=http://localhost:4005
  const fileUrl = `${process.env.API_URL}/uploads/${req.file.filename}`;
  req.body.profilePictureUrl = fileUrl;
  
  next();
};

module.exports = {
  uploader,
  addFileUrlToBody,
};
