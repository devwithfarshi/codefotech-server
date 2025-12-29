import ApiError from '@/common/utils/apiError';
import ApiResponse from '@/common/utils/apiResponse';
import asyncHandler from '@/common/utils/asyncHandler';
import { generateAccessToken } from '@/common/utils/jwtToken';
import sendEmail from '@/common/utils/sendEmail';
import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import userService from '../services/user.service';
import { setCookies } from '../utils/cookieUtils';
import { generateRandomPassword, generateRandomToken } from '../utils';

const authController = {
  // Register a new user
  register: asyncHandler(async (req: Request, res: Response) => {
    const userData = req.body;

    // Check if email already exists
    const emailExists = await userService.checkEmailExists(userData.email);
    if (emailExists) {
      // return next(ApiError.badRequest('Email already exists'));
      throw new ApiError(status.BAD_REQUEST, 'Email already exists', [
        {
          path: 'email',
          message: 'Email already exists',
        },
      ]);
    }

    const randomPassword = generateRandomPassword();
    userData.password = randomPassword;

    // Create user
    const user = await userService.createUser(userData);

    // Send email with random generation password
    await sendEmail(user.email, 'Verify Your Email', 'add-user', {
      name: user.name,
      email: user.email,
      password: userData.password,
    });

    // Remove sensitive data
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    const response = new ApiResponse(
      status.CREATED,
      {
        user: userResponse,
      },
      'User registered successfully'
    );
    res.status(response.statusCode).json(response);
  }),

  // Login user
  login: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Authenticate user
    const user = await userService.loginUser({ email, password });
    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password'));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(ApiError.unauthorized('Your account has been deactivated'));
    }

    // Generate tokens
    const token = generateAccessToken(user);

    // Set cookies
    setCookies(res, token);
    const response = new ApiResponse(
      status.OK,
      {
        token,
      },
      'Login successful'
    );
    res.status(response.statusCode).json(response);
  }),

  // Forgot password
  forgotPassword: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Find user by email
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return next(ApiError.notFound('User not found with this email'));
    }

    // Generate password reset token
    const resetToken = generateRandomToken();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to user
    await userService.setPasswordResetToken(user._id.toString(), resetToken, tokenExpiry);

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await sendEmail(user.email, 'Reset Your Password', 'password-reset', {
      name: user.name,
      resetUrl,
    });
    const response = new ApiResponse(status.OK, null, 'Password reset email sent');
    res.status(response.statusCode).json(response);
  }),

  // Reset password
  resetPassword: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;

    // Reset password
    const user = await userService.resetPasswordWithToken({ token, password });
    if (!user) {
      return next(ApiError.badRequest('Invalid or expired token'));
    }
    const response = new ApiResponse(status.OK, null, 'Password reset successful');
    res.status(response.statusCode).json(response);
  }),
};

export default authController;
