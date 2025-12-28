import { Request, Response, NextFunction } from 'express';
import status from 'http-status';
import ApiError from './apiError';

/**
 * Middleware to handle 404 errors for routes that are not found.
 * Creates a new instance of ApiError with a 404 status code and "Route Not Found" message.
 * Passes the error to the next middleware, typically the error handler.
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(status.NOT_FOUND, 'Route Not Found');
  next(error);
};

/**
 * Middleware to handle errors.
 * Handles Mongoose validation, duplicate key, and cast errors specifically.
 * If an ApiError is caught, it sends a structured response to the client.
 * Otherwise, it logs the error and returns a generic 500 Internal Server Error.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    err = new ApiError(status.BAD_REQUEST, 'Validation Error', messages);
  }

  // Handle Mongoose duplicate key errors
  if (err.code && err.code === 11000) {
    const message = 'Duplicate field value entered';
    err = new ApiError(status.BAD_REQUEST, message);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    err = new ApiError(status.NOT_FOUND, message);
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    err = new ApiError(status.BAD_REQUEST, 'Invalid JSON format in request body');
  }

  // If the error is an instance of ApiError, send the structured response
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  // Log unexpected errors and respond with a generic 500 error
  console.error(err);

  return res.status(status.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal Server Error',
  });
};
