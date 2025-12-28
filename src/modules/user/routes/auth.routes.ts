import validate from '@/common/middleware/validator.middlewares';
import express, { Router } from 'express';
import authController from '../controllers/auth.controller';
import userValidation from '../validations/user.validation';
import { protect } from '@/common/middleware/auth.middleware';
import { authorize } from 'passport';
import { UserRole } from '../types/user.types';

const router: Router = express.Router();

/**
 * @route POST /api/v1/auth/add-user
 * @desc Register a new user
 * @access Private (Admin only)
 */
router.post(
  '/add-user',
  protect,
  authorize(UserRole.ADMIN),
  validate(userValidation.createUser),
  authController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', validate(userValidation.loginUser), authController.login);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Send password reset email (Local users only)
 * @access Public
 */
router.post(
  '/forgot-password',
  validate({
    body: userValidation.loginUser.body.pick({ email: true }),
  }),
  authController.forgotPassword
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset user password (Local users only)
 * @access Public
 */
router.post(
  '/reset-password',
  validate(userValidation.resetPassword),
  authController.resetPassword
);

export default router;
