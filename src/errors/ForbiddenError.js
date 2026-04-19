//@ts-check

import AppError from './AppError.js';

import CommonErrors from './../constants/messages/errors/common.js';

/**
 * @description Error thrown when the user does not have permission to access a resource.
 * @example
 * throw new ForbiddenError('You do not have permission to access this resource.');
 * @example
 * throw new ForbiddenError();
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403
 */
export default class ForbiddenError extends AppError {
    /**
     * @description
     * @param {string} [message]
     * @param {string} [code]
     * @param {object | object[] | null} [details]
     */
    constructor(
        message = CommonErrors.FORBIDDEN.message,
        code = CommonErrors.FORBIDDEN.code,
        details = null
    ) {
        super(message, 403, code, details);
    }
}
