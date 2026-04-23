//@ts-check

import AppError from './AppError.js';

import CommonErrors from './../constants/messages/errors/common.js';

class NotFoundError extends AppError {
    /**
     * @param {string} [message=CommonErrors.RESOURCE_NOT_FOUND.message]
     * @param {string} [code=CommonErrors.RESOURCE_NOT_FOUND.code]
     * @param {object | object[] | null} [details=null]
     */
    constructor(
        message = CommonErrors.RESOURCE_NOT_FOUND.message,
        code = CommonErrors.RESOURCE_NOT_FOUND.code,
        details = null
    ) {
        super(message, 404, code, details);
    }
}

export default NotFoundError;
