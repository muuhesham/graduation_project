//@ts-check

import AppError from './AppError.js';

import CommonErrors from './../constants/messages/errors/common.js';

/**
 * @description Represents a validation error that occurs when input data fails to meet specified criteria.
 * This error is typically used to indicate that the client has provided invalid data in a request.
 * It extends the AppError class and includes additional details about the validation errors.
 *
 * @example
 * throw new ValidationError('Invalid email address', 'INVALID_EMAIL', [
 *   { field: 'email', message: 'Email must be a valid email address' }
 * ]);
 * @example
 * throw new ValidationError();
 *
 */
export default class ValidationError extends AppError {
    /**
     * @param {object[] | object} errors
     * @param {string} [message]
     * @param {string} [code]
     */
    constructor(
        errors,
        message = CommonErrors.VALIDATION_ERROR.message,
        code = CommonErrors.VALIDATION_ERROR.code
    ) {
        super(message, 422, code, errors);
    }
}
