//@ts-check

import AppError from './AppError.js';

import CommonErrors from '../constants/messages/errors/common.js';

export default class BadRequestError extends AppError {
    /**
     * @param {string} message
     * @param {string} code
     * @param {object | object[] | null} [details]
     */
    constructor(
        message = CommonErrors.TIMEOUT.message,
        code = CommonErrors.TIMEOUT.code,
        details = null
    ) {
        super(message, 400, code, details);
    }
}
