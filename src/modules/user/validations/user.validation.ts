import * as z from 'zod';

import { UserRoleList } from '../types/user.types';

/**
 * User validation schemas with Zod
 */
export const userValidation = {
  /**
   * Create user validation schema
   */
  createUser: {
    body: z.object({
      name: z
        .string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters'),
      email: z.email('Invalid email format').max(100, 'Email must be at most 100 characters'),
      role: z.enum(UserRoleList as [string, ...string[]]).optional(),
    }),
  },

  /**
   * Update user validation schema
   */
  updateUser: {
    body: z.object({
      name: z
        .string()
        .min(3, 'Mame must be at least 3 characters')
        .max(100, 'Name must be at most 100 characters')
        .optional(),
      email: z
        .email('Invalid email format')
        .max(100, 'Email must be at most 100 characters')
        .optional(),

      role: z.enum(UserRoleList as [string, ...string[]]).optional(),
      isActive: z.boolean().optional(),
    }),
  },

  /**
   * Login user validation schema
   */
  loginUser: {
    body: z.object({
      email: z.email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    }),
  },

  /**
   * Reset password validation schema
   */
  resetPassword: {
    body: z.object({
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be at most 100 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
      token: z.string(),
    }),
  },
};

export default userValidation;
