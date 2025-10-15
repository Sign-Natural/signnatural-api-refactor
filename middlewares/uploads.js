// middlewares/uploads.js
import multer from 'multer';

const MAX_FILE_SIZE = process.env.MAX_UPLOAD_SIZE
  ? parseInt(process.env.MAX_UPLOAD_SIZE, 10)
  : 3 * 1024 * 1024; // 3MB default

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!file || !file.mimetype) return cb(null, false);
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export { upload };
