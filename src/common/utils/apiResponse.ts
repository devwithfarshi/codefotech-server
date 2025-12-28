/**
 * Creates a response object to be sent back to the client.
 */
import status from 'http-status';

class ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;

  /**
   * @param {number} statusCode - The HTTP status code of the response.
   * @param {T} data - The data to include in the response.
   * @param {string} [message='Success'] - The message to include in the response.
   */
  constructor(statusCode: number, data: T, message: string = 'Success') {
    this.success = statusCode < status.BAD_REQUEST;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
