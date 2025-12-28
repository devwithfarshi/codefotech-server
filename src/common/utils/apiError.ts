/**
 * Custom error class for handling API errors.
 */
import status from 'http-status';

class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors: any[];

  /**
   * @param {number} statusCode - The HTTP status code.
   * @param {string} message - The error message.
   * @param {Array} [errors=[]] - Additional error details.
   * @param {string} [stack] - The error stack trace.
   */
  constructor(statusCode: number, message: string, errors: any[] = [], stack?: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message || 'Something went wrong';
    this.success = false;
    this.errors = errors;
  
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Creates a new ApiError instance with the specified status code and message.
   *
   * @param {number} statusCode - The HTTP status code.
   * @param {string} message - The error message.
   * @param {Array} [errors=[]] - Additional error details.
   * @returns {ApiError} - A new ApiError instance.
   */
  static createError(statusCode: number, message: string, errors: any[] = []): ApiError {
    return new ApiError(statusCode, message, errors);
  }
  
  /**
   * Creates a bad request error (HTTP 400).
   *
   * @param {string} message - The error message.
   * @param {Array} [errors=[]] - Additional error details.
   * @returns {ApiError} - A new ApiError instance.
   */
  static badRequest(message: string, errors: any[] = []): ApiError {
    return ApiError.createError(status.BAD_REQUEST, message, errors);
  }
  
  /**
   * Creates a not found error (HTTP 404).
   *
   * @param {string} message - The error message.
   * @param {Array} [errors=[]] - Additional error details.
   * @returns {ApiError} - A new ApiError instance.
   */
  static notFound(message: string, errors: any[] = []): ApiError {
    return ApiError.createError(status.NOT_FOUND, message, errors);
  }
  
  /**
   * Creates a forbidden error (HTTP 403).
   *
   * @param {string} message - The error message.
   * @param {Array} [errors=[]] - Additional error details.
   * @returns {ApiError} - A new ApiError instance.
   */
  static forbidden(message: string, errors: any[] = []): ApiError {
    return ApiError.createError(status.FORBIDDEN, message, errors);
  }
  
  /**
   * Creates an unauthorized error (HTTP 401).
   *
   * @param {string} message - The error message.
   * @param {Array} [errors=[]] - Additional error details.
   * @returns {ApiError} - A new ApiError instance.
   */
  static unauthorized(message: string, errors: any[] = []): ApiError {
    return ApiError.createError(status.UNAUTHORIZED, message, errors);
  }
  
  /**
   * Creates a conflict error (HTTP 409).
   *
   * @param {string} message - The error message.
   * @param {Array} [errors=[]] - Additional error details.
   * @returns {ApiError} - A new ApiError instance.
   */
  static conflict(message: string, errors: any[] = []): ApiError {
    return ApiError.createError(status.CONFLICT, message, errors);
  }
  
  /**
   * Creates an internal server error (HTTP 500).
   *
   * @param {string} message - The error message.
   * @param {Array} [errors=[]] - Additional error details.
   * @returns {ApiError} - A new ApiError instance.
   */
  static internal(message: string, errors: any[] = []): ApiError {
    return ApiError.createError(status.INTERNAL_SERVER_ERROR, message, errors);
  }
}

export default ApiError;