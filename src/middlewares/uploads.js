// src/middlewares/uploads.js
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const storage = multer.memoryStorage();

// limit: 5 MB
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only jpg/png/webp images allowed'));
    }
    cb(null, true);
  },
});

export function uploadToCloudinary(fileBuffer, folder = 'signnatural') {
  if (!process.env.CLOUDINARY_API_KEY) {
    return Promise.resolve(null); // Cloudinary not configured
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
}

export { upload };
