import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ApiError from './apiError';
import { Request } from 'express';

// Ensure upload directories exist
const createUploadDirectories = () => {
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const avatarPath = path.join(uploadPath, 'avatars');

  // Create directories if they don't exist
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  if (!fs.existsSync(avatarPath)) {
    fs.mkdirSync(avatarPath, { recursive: true });
  }
};

// Create directories on module import
createUploadDirectories();

// Configure storage for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const avatarPath = path.join(uploadPath, 'avatars');
    cb(null, avatarPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with user ID if available
    const userId = req.user?._id || 'user';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = path.extname(file.originalname);
    cb(null, `${userId}-${uniqueSuffix}${fileExt}`);
  },
});

// File filter for images
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only image files
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new ApiError(400, 'Only image files are allowed'));
  }
};

// Avatar upload middleware
const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // Default 5MB
  },
  fileFilter: imageFileFilter,
});

export { avatarUpload };
