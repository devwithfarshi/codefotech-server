import ApiError from '@/common/utils/apiError';
import ApiResponse from '@/common/utils/apiResponse';
import asyncHandler from '@/common/utils/asyncHandler';
import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import { Types } from 'mongoose';
import userService from '../services/user.service';

const userController = {
  // Get current user profile
  getMe: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(ApiError.unauthorized('Not authorized, no user found'));
    }
    //Todo: Get user more information if need
    const response = new ApiResponse(status.OK, user, 'User profile retrieved successfully');
    res.status(response.statusCode).json(response);
  }),

  // Get user by ID
  getUserById: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return next(ApiError.badRequest('Invalid user ID format'));
    }

    const user = await userService.getUserById(new Types.ObjectId(userId));

    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    const response = new ApiResponse(status.OK, { user }, 'User retrieved successfully');
    res.status(response.statusCode).json(response);
  }),

  // Update user profile
  updateProfile: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(ApiError.unauthorized('Not authorized, no user found'));
    }

    // Use validated data from middleware
    const updateData = req.body;

    const updatedUser = await userService.updateUser(user._id, updateData);

    if (!updatedUser) {
      return next(ApiError.notFound('User not found'));
    }
    const response = new ApiResponse(status.OK, updatedUser, 'Profile updated successfully');
    res.status(response.statusCode).json(response);
  }),

  // Deactivate user account
  deactivateAccount: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(ApiError.unauthorized('Not authorized, no user found'));
    }

    // Set isActive to false
    const updatedUser = await userService.updateUser(user._id, { isActive: false });

    if (!updatedUser) {
      return next(ApiError.notFound('User not found'));
    }

    const response = new ApiResponse(status.OK, null, 'Account deactivated successfully');
    res.status(response.statusCode).json(response);
  }),

  // Admin: Get all users (paginated)
  getAllUsers: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const users = await userService.getAllUsers({}, { page, limit });

    const response = new ApiResponse(status.OK, users, 'Users retrieved successfully');
    res.status(response.statusCode).json(response);
  }),
};

export default userController;
