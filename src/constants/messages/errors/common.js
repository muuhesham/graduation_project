//@ts-check

/**
 * @typedef {object} ErrorDescriptor
 * @property {string} code
 * @property {string} message
 */

const CommonErrors = Object.freeze({
    UNKNOWN_ERROR: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error has occurred.',
    },

    INVALID_REQUEST: {
        code: 'INVALID_REQUEST',
        message: 'The request is invalid.',
    },

    NOT_FOUND: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
    },

    UNAUTHORIZED: {
        code: 'UNAUTHORIZED',
        message: 'You are not authorized to perform this action.',
    },

    FORBIDDEN: {
        code: 'FORBIDDEN',
        message: 'Access to this resource is forbidden.',
    },

    INTERNAL_SERVER_ERROR: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error. Please try again later.',
    },

    SERVICE_UNAVAILABLE: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'The service is currently unavailable. Please try again later.',
    },

    TIMEOUT: {
        code: 'TIMEOUT',
        message: 'The request has timed out. Please try again.',
    },

    CONFLICT: {
        code: 'CONFLICT',
        message: 'A conflict occurred with the current state of the resource.',
    },

    BAD_GATEWAY: {
        code: 'BAD_GATEWAY',
        message: 'Received an invalid response from the upstream server.',
    },

    GATEWAY_TIMEOUT: {
        code: 'GATEWAY_TIMEOUT',
        message: 'The gateway has timed out while waiting for a response.',
    },

    RATE_LIMIT_EXCEEDED: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'You have exceeded the allowed number of requests. Please slow down.',
    },

    VALIDATION_ERROR: {
        code: 'VALIDATION_ERROR',
        message: 'There was a validation error with the provided data.',
    },

    RESOURCE_NOT_FOUND: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'The requested resource was not found.',
    },
});

export default CommonErrors;
