import { IUser, UserRole } from '../types/user.types';

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns Boolean indicating if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password strength
 * @param password Password to validate
 * @returns Boolean indicating if the password meets strength requirements
 */
export const isStrongPassword = (password: string): boolean => {
  // Password must be at least 8 characters long and contain at least one uppercase letter,
  // one lowercase letter, one number, and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Checks if a user object has admin privileges
 * @param user User object to check
 * @returns Boolean indicating if the user is an admin
 */
export const isAdmin = (user: IUser): boolean => {
  return user.role === UserRole.ADMIN;
};
