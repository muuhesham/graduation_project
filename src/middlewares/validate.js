import { validationResult } from 'express-validator';

import ValidationError from './../errors/ValidationError.js';

/**
 * @param {string} message
 * @returns {string}
 */
function inferValidationCode(message) {
    const normalized = message.toLowerCase();

    if (normalized.includes('required')) return 'VALIDATION_REQUIRED';
    if (normalized.includes('email')) return 'VALIDATION_EMAIL_INVALID';
    if (normalized.includes('phone')) return 'VALIDATION_PHONE_INVALID';
    if (normalized.includes('url') || normalized.includes('link')) return 'VALIDATION_URL_INVALID';
    if (normalized.includes('must be one of')) return 'VALIDATION_ENUM_INVALID';
    if (normalized.includes('cannot exceed') || normalized.includes('maximum')) {
        return 'VALIDATION_MAX_LENGTH';
    }
    if (normalized.includes('at least') || normalized.includes('minimum')) {
        return 'VALIDATION_MIN_LENGTH';
    }
    if (
        normalized.includes('integer') ||
        normalized.includes('number') ||
        normalized.includes('numeric')
    ) {
        return 'VALIDATION_NUMBER_INVALID';
    }

    return 'VALIDATION_INVALID_FIELD';
}

/**
 * @param {any} rawMsg
 * @returns {{ message: string, code: string }}
 */
function normalizeValidationMessage(rawMsg) {
    if (
        rawMsg &&
        typeof rawMsg === 'object' &&
        typeof rawMsg.message === 'string' &&
        typeof rawMsg.code === 'string'
    ) {
        return {
            message: rawMsg.message,
            code: rawMsg.code,
        };
    }

    const message = typeof rawMsg === 'string' ? rawMsg : 'Invalid field value';
    return {
        message,
        code: inferValidationCode(message),
    };
}

function validate(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const errorsByField = {};
    for (const err of result.array()) {
        const field = err.param || err.path || 'general';
        if (!errorsByField[field]) {
            const normalized = normalizeValidationMessage(err.msg);
            errorsByField[field] = {
                field,
                message: normalized.message,
                code: normalized.code,
            };
        }
    }

    throw new ValidationError(Object.values(errorsByField));
}

export default validate;
