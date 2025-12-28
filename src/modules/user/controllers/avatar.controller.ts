import { NextFunction, Request, Response } from 'express';
import ApiError from '@/common/utils/apiError';
import ApiResponse from '@/common/utils/apiResponse';
import asyncHandler from '@/common/utils/asyncHandler';
import status from 'http-status';
import userService from '../services/user.service';
import fs from 'fs';
import path from 'path';

// Type declarations are now in src/types/express.d.ts

interface AvatarController {
  [key: string]: (req: Request, res: Response, next: NextFunction) => void;
}

const avatarController: AvatarController = {
  // Upload user avatar
  uploadAvatar: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(ApiError.unauthorized('Not authorized, no user found'));
    }

    if (!req.file) {
      return next(ApiError.badRequest('No file uploaded'));
    }

    // Get file details
    const { filename, path: filePath } = req.file;
    
    // Create avatar object
    const avatar = {
      public_id: filename,
      url: `/uploads/avatars/${filename}`,
    };

    // If user already has an avatar, delete the old file
    if (user.avatar?.public_id) {
      const oldAvatarPath = path.join(
        process.env.UPLOAD_PATH || './uploads',
        'avatars',
        user.avatar.public_id
      );
      
      // Delete old avatar file if it exists
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user with new avatar
    const updatedUser = await userService.updateUser(user._id, { avatar });

    if (!updatedUser) {
      return next(ApiError.notFound('User not found'));
    }

    const response = new ApiResponse(
      status.OK,
      { user: updatedUser },
      'Avatar uploaded successfully'
    );
    res.status(response.statusCode).json(response);
  }),

  // Delete user avatar
  deleteAvatar: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(ApiError.unauthorized('Not authorized, no user found'));
    }

    // Check if user has an avatar
    if (!user.avatar?.public_id) {
      return next(ApiError.badRequest('No avatar to delete'));
    }

    // Delete avatar file
    const avatarPath = path.join(
      process.env.UPLOAD_PATH || './uploads',
      'avatars',
      user.avatar.public_id
    );
    
    // Delete file if it exists
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }

    // Update user to remove avatar
    const updatedUser = await userService.updateUser(user._id, { avatar: undefined });

    if (!updatedUser) {
      return next(ApiError.notFound('User not found'));
    }

    const response = new ApiResponse(
      status.OK,
      { user: updatedUser },
      'Avatar deleted successfully'
    );
    res.status(response.statusCode).json(response);
  }),
};

export default avatarController;