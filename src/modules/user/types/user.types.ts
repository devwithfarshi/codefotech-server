import mongoose from 'mongoose';
import * as z from 'zod';
import userValidation from '../validations/user.validation';

// User Role Enum
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
}

// User Role List
export const UserRoleList = Object.values(UserRole);

// User Interface
export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole | null;
  isActive: boolean;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Export inferred types from Zod schemas
export type CreateUserType = z.infer<typeof userValidation.createUser.body>;
export type UpdateUserType = z.infer<typeof userValidation.updateUser.body>;
export type LoginUserType = z.infer<typeof userValidation.loginUser.body>;
export type ResetPasswordType = z.infer<typeof userValidation.resetPassword.body>;
