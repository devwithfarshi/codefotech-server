import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ApiError from '@/common/utils/apiError';

// Allowed image mime types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Get upload path from environment
const getUploadPath = (): string => {
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const blogUploadPath = path.join(uploadPath, 'blog');

  // Ensure directory exists
  if (!fs.existsSync(blogUploadPath)) {
    fs.mkdirSync(blogUploadPath, { recursive: true });
  }

  return blogUploadPath;
};

// Storage configuration for blog images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadPath();
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Temporary filename - will be renamed after we know the slug
    const tempName = `temp_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, tempName);
  },
});

// File filter to validate image types
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.map((t) => t.split('/')[1]).join(', ')}`
      )
    );
  }
};

// Multer upload instance for blog images
export const blogImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Rename uploaded file to use blog slug
 * @param tempFilePath Current temporary file path
 * @param slug Blog slug to use as filename
 * @returns New file path and public_id
 */
export const renameImageToSlug = (
  tempFilePath: string,
  slug: string
): { filePath: string; public_id: string; url: string } => {
  const uploadPath = getUploadPath();
  const ext = path.extname(tempFilePath);
  const newFileName = `${slug}${ext}`;
  const newFilePath = path.join(uploadPath, newFileName);

  // If a file with the same slug already exists, delete it first
  if (fs.existsSync(newFilePath)) {
    fs.unlinkSync(newFilePath);
  }

  // Copy the file to new location and delete the temp file
  fs.copyFileSync(tempFilePath, newFilePath);
  fs.unlinkSync(tempFilePath);

  // Build the URL
  const url = `/uploads/blog/${newFileName}`;

  return {
    filePath: newFilePath,
    public_id: slug,
    url,
  };
};

/**
 * Delete blog image by slug
 * @param slug Blog slug (used as public_id)
 * @returns true if deleted, false if not found
 */
export const deleteBlogImage = (slug: string): boolean => {
  const uploadPath = getUploadPath();

  // Check for common image extensions
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  for (const ext of extensions) {
    const filePath = path.join(uploadPath, `${slug}${ext}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  }

  return false;
};

/**
 * Delete temporary uploaded file (cleanup on error)
 * @param filePath Path to the temporary file
 */
export const deleteTempFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export default blogImageUpload;
