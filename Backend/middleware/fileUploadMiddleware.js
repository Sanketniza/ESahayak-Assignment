const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Detect serverless (Vercel) environment and choose a writable directory
const isVercel = !!process.env.VERCEL;
const defaultLocalUploads = path.join(__dirname, '../uploads');
const serverlessUploads = path.join('/tmp', 'uploads');
const targetUploadsDir = process.env.UPLOAD_DIR || (isVercel ? serverlessUploads : defaultLocalUploads);

// Ensure uploads directory exists
if (!fs.existsSync(targetUploadsDir)) {
  try {
    fs.mkdirSync(targetUploadsDir, { recursive: true });
  } catch (e) {
    // Last resort: fallback to /tmp if anything goes wrong
    if (targetUploadsDir !== serverlessUploads) {
      try {
        fs.mkdirSync(serverlessUploads, { recursive: true });
      } catch (_) {}
    }
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Always use the computed target directory
    cb(null, targetUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to ensure only CSV files are uploaded
const fileFilter = (req, file, cb) => {
  const filetypes = /csv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

// Configure multer upload middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max file size
  }
});

module.exports = upload;