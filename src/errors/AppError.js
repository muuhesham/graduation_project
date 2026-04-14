//@ts-check

export default class AppError extends Error {
    /**
     * @description Base class for application-specific errors. All custom errors should extend this class.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code associated with the error.
     * @param {string} code - A unique error code for programmatic identification.
     * @param {object | object[] | null} [details] - Optional array of additional details about the error.
     * @example
     *     throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
     *    @example
     *    throw new AppError('Validation failed', 422, 'VALIDATION_ERROR', [
     *        { field: 'email', message: 'Email is required' },
     *       { field: 'password', message: 'Password must be at least 8 characters' },
     *   ]);
     */
    constructor(message, statusCode, code, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.code = code;
        this.details = details == null ? null : Array.isArray(details) ? details : [details];
        Error.captureStackTrace(this, this.constructor);
    }
}
