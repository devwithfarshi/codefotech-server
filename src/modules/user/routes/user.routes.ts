import express, { Router } from 'express';
import { protect, authorize } from '@/common/middleware/auth.middleware';
import userController from '../controllers/user.controller';
import userValidation from '../validations/user.validation';
import validate from '@/common/middleware/validator.middlewares';

const router: Router = express.Router();

/**
 * @route GET /api/v1/users/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me', protect, userController.getMe);

/**
 * @route GET /api/v1/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', protect, userController.getUserById);

/**
 * @route PUT /api/v1/users/profile
 * @desc Update user profile
 * @access Private
 */
// router.put('/profile', protect, validate(userValidation.updateUser), userController.updateProfile);

/**
 * @route DELETE /api/v1/users/deactivate
 * @desc Deactivate user account
 * @access Private
 */
router.delete('/deactivate', protect, userController.deactivateAccount);

/**
 * @route GET /api/v1/users
 * @desc Get all users (paginated)
 * @access Private/Admin
 */
router.get('/', protect, authorize('admin'), userController.getAllUsers);

export default router;
