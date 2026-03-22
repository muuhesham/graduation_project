//@ts-check

import AppError from './AppError.js';
import common from './../constants/errors/common.js';

export default class ValidationError extends AppError {
    /**
     * @example
     *     // Example of using ValidationError with a single error object
     *     throw new ValidationError('Invalid input', {
     *         field: 'email',
     *         message: 'Email is required',
     *     });
     *
     * @example
     *     // Example of using ValidationError with an array of error objects
     *     throw new ValidationError('Multiple validation errors', [
     *         { field: 'email', message: 'Email is required' },
     *         { field: 'password', message: 'Password must be at least 8 characters' },
     *     ]);
     *
     * @param {string} message - The error message.
     * @param {object | object[]} errors - Detailed information about the validation errors. Can be
     *   a single object or an array of objects.
     */
    constructor(message = common.VALIDATION_ERROR, errors) {
        super(message, 422, 'VALIDATION_ERROR');
        this.errors = Array.isArray(errors) ? errors : [errors];
    }
}
