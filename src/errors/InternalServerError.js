//@ts-check

import AppError from './AppError.js';

import CommonErrors from './../constants/messages/errors/common.js';

export default class InternalServerError extends AppError {
    /**
     * @param {string} [message]
     * @param {string} [code]
     * @param {object | object[] | null} [details=null]
     */
    constructor(
        message = CommonErrors.INTERNAL_SERVER_ERROR.message,
        code = CommonErrors.INTERNAL_SERVER_ERROR.code,
        details = null
    ) {
        super(message, 500, code, details);
    }
}
