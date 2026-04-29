//@ts-check

import AppError from './AppError.js';

import CommonErrors from './../constants/messages/errors/common.js';

export default class UnauthorizedError extends AppError {
    /**
     * @description Error thrown when the user is not authenticated.
     * @example
     * throw new UnauthorizedError('You must be logged in to access this resource.');
     * @example
     * throw new UnauthorizedError();
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
     *
     * @param {string} [message]
     * @param {string} [code]
     * @param {object | object[] | null} [details=null]
     */
    constructor(
        message = CommonErrors.UNAUTHORIZED.message,
        code = CommonErrors.UNAUTHORIZED.code,
        details = null
    ) {
        super(message, 401, code, details);
    }
}
