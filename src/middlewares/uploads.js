import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
