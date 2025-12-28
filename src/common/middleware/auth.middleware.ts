import ApiError from '@/common/utils/apiError';
import { verifyAccessToken } from '@/common/utils/jwtToken';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import userService from '../../modules/user/services/user.service';
import { IUser, UserRoleList } from '../../modules/user/types/user.types';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // Get token from Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return next(ApiError.unauthorized('Not authorized, no token provided'));
    }

    try {
      // Verify token using the utility function
      const decoded = verifyAccessToken(token);

      // Get user from database
      const user = await userService.getUserById(new Types.ObjectId(decoded._id));
      console.log({
        decoded,
        user,
      });
      // Check if user exists
      if (!user) {
        return next(ApiError.unauthorized('Not authorized, user not found'));
      }
      // Check if user's role is valid
      if (user.role && !UserRoleList.includes(user.role)) {
        return next(ApiError.forbidden(`Role (${user.role}) is not valid.`));
      }

      // Check if user is active
      if (!user.isActive) {
        return next(ApiError.unauthorized('Your account has been deactivated'));
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      return next(ApiError.unauthorized('Not authorized, token failed'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
      return next(ApiError.forbidden('Not authorized to access this resource'));
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Role (${req.user.role}) is not authorized to access this resource`)
      );
    }

    next();
  };
};
