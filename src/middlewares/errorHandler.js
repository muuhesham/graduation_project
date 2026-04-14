import { NODE_ENV } from './../config/env.js';

import { sendFail, sendError } from '../utils/response.js';

function errorHandler(err, req, res, next) {
    if (err.code && err.code.startsWith('P')) {
        return handlePrismaError(err, req, res);
    }

    if (err.isOperational) {
        return handleAppError(err, req, res);
    }

    if (NODE_ENV !== 'production') {
        return next(err);
    }

    return sendError(res, 'An unexpected error occurred', 'INTERNAL_ERROR', null, 500);
}

function handleAppError(err, req, res) {
    const statusCode = err.statusCode || 500;
    const details = err.details || null;
    return sendFail(res, details, statusCode, err.code);
}

function handlePrismaError(err, req, res) {
    switch (err.code) {
        case 'P2002': {
            const field = err.meta?.target?.[0] || 'field';
            const message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use. Please try another one.`;
            return sendFail(res, { message }, 400);
        }
        case 'P2025':
            return sendFail(res, { message: 'Record not found' }, 404);
        case 'P2003':
            return sendFail(
                res,
                {
                    message:
                        'The provided reference ID is invalid. Some data might have been deleted.',
                },
                400
            );
        case 'P2000':
            return sendFail(res, { message: 'Value too long for the field' }, 400);
        default:
            return sendError(res, 'Database error occurred', 500);
    }
}

export { errorHandler };
