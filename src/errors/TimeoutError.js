//@ts-check

import AppError from './AppError.js';

import CommonErrors from './../constants/errors/common.js';

export default class TimeoutError extends AppError {
    /**
     * @param {string} message
     * @param {string} code
     * @param {object | object[] | null} [details]
     */
    constructor(message, code, details) {
        super(message, 408, code);
    }
}
