//@ts-check

import AppError from './AppError.js';
import CommonErrors from './../constants/messages/errors/common.js';

export default class ConflictError extends AppError {
    /**
     * @param {string} [message]
     * @param {string} [code]
     * @param {object | object[] | null} [details]
     */
    constructor(
        message = CommonErrors.CONFLICT.message,
        code = CommonErrors.CONFLICT.code,
        details = null
    ) {
        super(message, 409, code, details);
    }
}
