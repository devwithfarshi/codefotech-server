import { Response } from 'express';

/**
 * Sets authentication cookies in the response
 * @param res Express Response object
 * @param token JWT access token
 */
export const setCookies = (res: Response, token: string): void => {
  // Set JWT token cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

/**
 * Clears authentication cookies from the response
 * @param res Express Response object
 */
export const clearCookies = (res: Response): void => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};
