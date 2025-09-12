// src/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

// DEBUG - helpful during development (remove in prod)
console.log('cloudinary config check:', {
  CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET,
});

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    'Cloudinary env vars missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Uploads will fail until these are set.'
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export function uploadBufferToCloudinary(buffer, options = {}) {
  if (!buffer) {
    return Promise.reject(new Error('uploadBufferToCloudinary: buffer is required'));
  }

  const uploadOptions = {
    folder: options.folder || 'signnatural',
    ...options,
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return null;
  // Return promise (cloudinary v2 supports promise)
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
