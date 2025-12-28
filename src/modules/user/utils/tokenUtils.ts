import crypto from 'crypto';

/**
 * Generates a random token for email verification or password reset
 * @returns A random hexadecimal string
 */
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generates a random 8-digit password
 * @returns A random 8-character alphanumeric password
 */
export const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
};
