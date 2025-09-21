const admin = require('../config/firebaseAdmin');
const multer = require('multer');
const path = require('path');

// Make sure to set your Firebase Storage bucket name in your .env file
const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
if (!bucketName) {
  throw new Error('FIREBASE_STORAGE_BUCKET environment variable not set.');
}
const bucket = admin.storage().bucket(bucketName);

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});

const uploadImageToFirebase = (req, res, next) => {
  if (!req.file) {
    // If no file is uploaded, just skip to the next middleware.
    // This allows updating other profile info without changing the picture.
    return next();
  }

  const blob = bucket.file(Date.now() + path.extname(req.file.originalname));
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobStream.on('error', (err) => {
    return res.status(500).json({ message: 'Erro ao fazer upload da imagem.', error: err });
  });

  blobStream.on('finish', async () => {
    try {
      // Make the file public
      await blob.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      
      // Add the URL to the request object to be saved by the controller
      req.body.profilePictureUrl = publicUrl;
      
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao tornar a imagem pública.', error });
    }
  });

  blobStream.end(req.file.buffer);
};

module.exports = {
  uploader,
  uploadImageToFirebase,
};
