import { Request, Response, NextFunction } from 'express';

/**
 * Async handler to wrap async route handlers and catch errors
 *
 * @param {Function} fn - The async function to handle the route
 * @returns {Function} - Express middleware function
 */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
